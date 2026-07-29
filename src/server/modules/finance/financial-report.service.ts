import { billboardRepository } from '@/server/modules/billboards/billboard.repository';
import { bookingRepository } from '@/server/modules/bookings/booking.repository';
import {
  expenseRepository,
  ownerPaymentRepository,
} from '@/server/modules/finance/finance.repository';
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_STATUSES,
  FINANCE_BASE_CURRENCY,
} from '@/shared/constants/finance';
import { BOOKING_STATUSES } from '@/shared/constants/booking';
import {
  inclusiveDayCount,
  monthBuckets,
  netProfit,
  occupancyRate,
  overlapDays,
  profitMargin,
  round2,
} from '@/shared/finance/finance-math';
import { authorizationPolicy } from '@/shared/policies';
import type {
  BillboardProfitability,
  CategoryTotal,
  FinanceOverview,
  MonthlyFinancePoint,
} from '@/shared/types/finance';
import type { User } from '@/shared/types/user';

/**
 * Turns reservations (money in) and expenses (money out) into the figures the
 * platform owner acts on.
 *
 * Revenue is read from bookings but never written by this module — the
 * advertiser payment flow stays the single source of truth for what customers
 * owe and have paid. This service only reads it, so profitability can never
 * alter a customer's balance.
 */

/** A reservation counts as revenue once it is confirmed, not merely requested. */
const REVENUE_STATUSES: string[] = [BOOKING_STATUSES.APPROVED, BOOKING_STATUSES.COMPLETED];

type Window = { from: Date; to: Date };

function defaultWindow(now: Date): Window {
  // Twelve months back through the end of the current month: long enough for a
  // year-on-year read, short enough that a first-time database stays fast.
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { from, to };
}

function monthKeyOf(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export const financialReportService = {
  /**
   * Everything the finance dashboard renders, in one owner-scoped read.
   *
   * Assembled server-side rather than by the client so revenue and expenses are
   * always computed over the identical window — two separate calls could
   * straddle a month boundary and show a profit that never existed.
   */
  async overview(actor: User, range?: { from?: string; to?: string }): Promise<FinanceOverview> {
    authorizationPolicy.finance.assertCanView(actor);

    const now = new Date();
    const fallback = defaultWindow(now);
    const from = range?.from ? new Date(range.from) : fallback.from;
    const to = range?.to ? new Date(range.to) : fallback.to;

    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

    const [bookings, billboards, expenses, categoryTotals, expenseMonths, statusTotals, owed] =
      await Promise.all([
        bookingRepository.findMany({}),
        billboardRepository.findMany({}),
        expenseRepository.sumByBillboard(from, to),
        expenseRepository.sumByCategory(from, to),
        expenseRepository.sumByMonth(from, to),
        expenseRepository.sumByStatus(from, to),
        ownerPaymentRepository.outstanding(now, monthEnd),
      ]);

    const revenueBookings = bookings.filter((booking) => REVENUE_STATUSES.includes(booking.status));

    // Revenue is attributed to the month a campaign starts, matching how the
    // advertiser dashboard reports spend, so the two screens never disagree.
    const revenueByMonth = new Map<string, number>();
    const revenueByBillboard = new Map<
      string,
      { revenue: number; bookings: number; days: number }
    >();
    let totalRevenue = 0;
    let currentMonthRevenue = 0;
    let currentYearRevenue = 0;

    for (const booking of revenueBookings) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const total = booking.pricing?.total ?? 0;

      if (start >= from && start <= to) {
        totalRevenue += total;
        const key = monthKeyOf(start);
        revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + total);
      }
      if (start >= monthStart && start <= monthEnd) currentMonthRevenue += total;
      if (start >= yearStart) currentYearRevenue += total;

      const billboardId = String(booking.billboardId);
      const bucket = revenueByBillboard.get(billboardId) ?? { revenue: 0, bookings: 0, days: 0 };
      if (start >= from && start <= to) {
        bucket.revenue += total;
        bucket.bookings += 1;
      }
      bucket.days += overlapDays(start, end, from, to);
      revenueByBillboard.set(billboardId, bucket);
    }

    const expensesByBillboard = new Map(
      expenses.map((row) => [row.billboardId, row.amount] as const),
    );

    const totalExpenses = round2(
      (statusTotals[EXPENSE_STATUSES.PENDING] ?? 0) + (statusTotals[EXPENSE_STATUSES.PAID] ?? 0),
    );
    const currentMonthExpenses = round2(
      expenseMonths
        .filter((row) => row.month === monthKeyOf(now))
        .reduce((total, row) => total + row.amount, 0),
    );

    const windowDays = inclusiveDayCount(from, to);

    const profitability: BillboardProfitability[] = billboards
      .map((billboard) => {
        const id = String(billboard._id);
        const revenue = round2(revenueByBillboard.get(id)?.revenue ?? 0);
        const billboardExpenses = round2(expensesByBillboard.get(id) ?? 0);
        const profit = netProfit(revenue, billboardExpenses);

        return {
          billboardId: id,
          name: billboard.name,
          city: billboard.location?.city ?? '—',
          type: billboard.type,
          revenue,
          bookings: revenueByBillboard.get(id)?.bookings ?? 0,
          occupancyRate: occupancyRate(revenueByBillboard.get(id)?.days ?? 0, windowDays),
          expenses: billboardExpenses,
          netProfit: profit,
          margin: profitMargin(profit, revenue),
        };
      })
      // A billboard with neither revenue nor cost tells the operator nothing.
      .filter((row) => row.revenue > 0 || row.expenses > 0)
      .sort((a, b) => b.netProfit - a.netProfit);

    const monthly: MonthlyFinancePoint[] = monthBuckets(from, to).map((bucket) => {
      const revenue = round2(revenueByMonth.get(bucket.month) ?? 0);
      const monthExpenses = round2(
        expenseMonths.find((row) => row.month === bucket.month)?.amount ?? 0,
      );

      return {
        month: bucket.month,
        label: bucket.label,
        revenue,
        expenses: monthExpenses,
        profit: netProfit(revenue, monthExpenses),
      };
    });

    const byCategory: CategoryTotal[] = categoryTotals.map((row) => ({
      ...row,
      label: EXPENSE_CATEGORY_LABELS[row.category] ?? row.category,
      baseAmount: round2(row.baseAmount),
    }));

    const grossRevenue = round2(totalRevenue);
    const net = netProfit(grossRevenue, totalExpenses);

    return {
      baseCurrency: FINANCE_BASE_CURRENCY,
      window: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) },
      revenue: {
        total: grossRevenue,
        currentMonth: round2(currentMonthRevenue),
        currentYear: round2(currentYearRevenue),
        bookings: revenueBookings.length,
      },
      expenses: {
        total: totalExpenses,
        currentMonth: currentMonthExpenses,
        pending: round2(statusTotals[EXPENSE_STATUSES.PENDING] ?? 0),
        paid: round2(statusTotals[EXPENSE_STATUSES.PAID] ?? 0),
      },
      profit: {
        // Gross profit here is revenue less direct billboard costs; net also
        // carries government and business overhead.
        gross: netProfit(
          grossRevenue,
          round2(
            byCategory
              .filter((row) => row.group === 'billboard')
              .reduce((total, row) => total + row.baseAmount, 0),
          ),
        ),
        net,
        margin: profitMargin(net, grossRevenue),
      },
      ownerObligations: owed,
      byCategory,
      monthly,
      billboards: profitability,
    };
  },
};
