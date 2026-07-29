import {
  FINANCE_BASE_CURRENCY,
  RECURRENCE_MONTHLY_FACTOR,
  EXPENSE_CATEGORY_GROUP_OF,
  EXPENSE_CATEGORY_GROUPS,
} from '@/shared/constants/finance';
import type { ExpenseCategoryGroup, ExpenseRecurrence } from '@/shared/types/finance';

/**
 * The arithmetic behind every figure in the finance module.
 *
 * Kept pure and framework-free so the numbers an operator makes decisions on
 * are unit-testable without a database. Money is rounded to cents at each
 * boundary rather than at the end, so a total always equals the sum of the
 * rounded parts an operator can see on screen.
 */

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Converts a foreign-currency amount into the reporting currency.
 *
 * Refuses a missing rate for a foreign currency instead of defaulting to 1:
 * a silent 1:1 would treat 1,000,000 LBP as $1,000,000 and corrupt every
 * downstream total.
 */
export function toBaseAmount(
  amount: number,
  currency: string,
  exchangeRate?: number,
): { baseAmount: number; exchangeRate: number } {
  if (currency === FINANCE_BASE_CURRENCY) {
    return { baseAmount: round2(amount), exchangeRate: 1 };
  }

  if (!exchangeRate || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new Error(
      `An exchange rate to ${FINANCE_BASE_CURRENCY} is required for ${currency} amounts.`,
    );
  }

  return { baseAmount: round2(amount * exchangeRate), exchangeRate };
}

/** Monthly-equivalent cost of a recurring expense; one-offs contribute zero. */
export function monthlyEquivalent(baseAmount: number, recurrence: ExpenseRecurrence): number {
  return round2(baseAmount * (RECURRENCE_MONTHLY_FACTOR[recurrence] ?? 0));
}

export function categoryGroupOf(category: string): ExpenseCategoryGroup {
  return (EXPENSE_CATEGORY_GROUP_OF[category] ??
    EXPENSE_CATEGORY_GROUPS.BUSINESS) as ExpenseCategoryGroup;
}

/**
 * Profit margin as a fraction of revenue.
 *
 * Null when there is no revenue: dividing by zero would render as `Infinity%`
 * or `NaN`, and "no revenue" is a distinct state from "0% margin".
 */
export function profitMargin(netProfit: number, revenue: number): number | null {
  if (revenue <= 0) return null;
  return round2((netProfit / revenue) * 100);
}

export function netProfit(revenue: number, expenses: number): number {
  return round2(revenue - expenses);
}

/**
 * Share of the window covered by booked days, clamped to 1.
 *
 * A digital screen rotates several ads at once, so summed booked days can
 * exceed the window length; occupancy is a utilisation ratio, not a count, and
 * a value above 100% would be meaningless on screen.
 */
export function occupancyRate(bookedDays: number, windowDays: number): number {
  if (windowDays <= 0) return 0;
  return round2(Math.min(bookedDays / windowDays, 1));
}

/** Inclusive day count between two dates. */
export function inclusiveDayCount(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.floor(ms / 86_400_000) + 1;
}

/**
 * Overlap in days between a reservation and the report window.
 *
 * A campaign that starts before the window or ends after it should only
 * contribute the days that actually fall inside, otherwise occupancy for a
 * single month can be inflated by a year-long booking.
 */
export function overlapDays(
  bookingStart: Date,
  bookingEnd: Date,
  windowStart: Date,
  windowEnd: Date,
): number {
  const start = Math.max(bookingStart.getTime(), windowStart.getTime());
  const end = Math.min(bookingEnd.getTime(), windowEnd.getTime());
  if (end < start) return 0;
  return Math.floor((end - start) / 86_400_000) + 1;
}

export type MonthBucket = { month: string; label: string };

/** Ordered `YYYY-MM` buckets covering the window, oldest first. */
export function monthBuckets(from: Date, to: Date): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const last = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));

  while (cursor <= last) {
    const month = cursor.toISOString().slice(0, 7);
    buckets.push({
      month,
      label: cursor.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
        timeZone: 'UTC',
      }),
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return buckets;
}
