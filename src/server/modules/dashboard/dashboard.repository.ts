import { connectToDatabase } from '@/server/db/mongoose';
import { BillboardModel } from '@/server/modules/billboards/billboard.model';
import { BookingModel } from '@/server/modules/bookings/booking.model';
import { BILLBOARD_STATUSES } from '@/shared/constants/billboard';
import { BOOKING_STATUSES } from '@/shared/constants/booking';
import type { DashboardOverviewResult } from '@/server/modules/dashboard/dashboard.types';

const REVENUE_BOOKING_STATUSES = [BOOKING_STATUSES.APPROVED, BOOKING_STATUSES.COMPLETED] as const;
const INVENTORY_STATUS_ORDER = [
  BILLBOARD_STATUSES.AVAILABLE,
  BILLBOARD_STATUSES.RESERVED,
  BILLBOARD_STATUSES.OCCUPIED,
  BILLBOARD_STATUSES.MAINTENANCE,
] as const;

type AggregateTotalRow = {
  _id: null;
  total: number;
};

type AggregateCountRow = {
  _id: string;
  count: number;
};

type RevenueByCityRow = {
  _id: string;
  revenue: number;
  bookings: number;
};

type TopLocationRow = {
  _id: string;
  revenue: number;
  reservations: number;
  billboardName: string;
  city: string;
};

type BookingListRow = {
  _id: string;
  campaignName: string;
  companyName: string;
  amount: number;
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  billboardName: string;
  city: string;
};

type LiveInventoryCityRow = {
  _id: string;
  live: number;
  booked: number;
  maintenance: number;
  total: number;
};

function startOfUtcMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addUtcMonths(date: Date, count: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, count: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + count);
  return next;
}

function shiftUtcMonthKeepingDay(date: Date, count: number) {
  const targetStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
  const lastDayInTargetMonth = new Date(
    Date.UTC(targetStart.getUTCFullYear(), targetStart.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const day = Math.min(date.getUTCDate(), lastDayInTargetMonth);

  return new Date(
    Date.UTC(
      targetStart.getUTCFullYear(),
      targetStart.getUTCMonth(),
      day,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

function formatIsoDate(value: Date) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDayLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}

function toTrend(change: number) {
  if (change > 0) return 'up' as const;
  if (change < 0) return 'down' as const;
  return 'flat' as const;
}

function computeChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

async function sumRevenue(match: Record<string, unknown>) {
  const [row] = await BookingModel.aggregate<AggregateTotalRow>([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } },
  ]).exec();

  return row?.total ?? 0;
}

async function lookupRecentBookings(match: Record<string, unknown>, limit: number) {
  return BookingModel.aggregate<BookingListRow>([
    { $match: match },
    { $addFields: { billboardObjectId: { $toObjectId: '$billboardId' } } },
    {
      $lookup: {
        from: 'billboards',
        localField: 'billboardObjectId',
        foreignField: '_id',
        as: 'billboard',
      },
    },
    {
      $unwind: {
        path: '$billboard',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        campaignName: 1,
        companyName: '$company.name',
        amount: '$pricing.total',
        status: 1,
        startDate: 1,
        endDate: 1,
        createdAt: 1,
        updatedAt: 1,
        billboardName: { $ifNull: ['$billboard.name', 'Unassigned billboard'] },
        city: { $ifNull: ['$billboard.location.city', 'Unknown city'] },
      },
    },
  ]).exec();
}

export const dashboardRepository = {
  async getAdminOverview(now: Date): Promise<DashboardOverviewResult> {
    await connectToDatabase();

    const monthStart = startOfUtcMonth(now);
    const nextMonthStart = addUtcMonths(monthStart, 1);
    const previousMonthStart = addUtcMonths(monthStart, -1);
    const comparisonDate = shiftUtcMonthKeepingDay(now, -1);
    const chartStart = addUtcDays(startOfUtcDay(now), -6);
    const chartEnd = addUtcDays(startOfUtcDay(now), 1);

    const [
      totalBillboards,
      totalBillboardsPreviousMonth,
      totalBillboardsCurrentMonth,
      activeReservationsCurrent,
      activeReservationsPrevious,
      revenueCurrent,
      revenuePrevious,
      pendingApprovalsCurrent,
      pendingApprovalsPreviousMonth,
      inventoryStatusRows,
      revenueSeriesRows,
      bookingSeriesRows,
      revenueByCityRows,
      topLocationRows,
      pendingApprovalsRows,
      recentReservationsRows,
      recentActivityRows,
      liveInventoryRows,
    ] = await Promise.all([
      BillboardModel.countDocuments({}).exec(),
      BillboardModel.countDocuments({ createdAt: { $lt: monthStart } }).exec(),
      BillboardModel.countDocuments({
        createdAt: { $gte: monthStart, $lt: nextMonthStart },
      }).exec(),
      BookingModel.countDocuments({
        status: { $in: REVENUE_BOOKING_STATUSES },
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).exec(),
      BookingModel.countDocuments({
        status: { $in: REVENUE_BOOKING_STATUSES },
        startDate: { $lte: comparisonDate },
        endDate: { $gte: comparisonDate },
      }).exec(),
      sumRevenue({
        status: { $in: REVENUE_BOOKING_STATUSES },
        createdAt: { $gte: monthStart, $lt: nextMonthStart },
      }),
      sumRevenue({
        status: { $in: REVENUE_BOOKING_STATUSES },
        createdAt: { $gte: previousMonthStart, $lt: monthStart },
      }),
      BookingModel.countDocuments({ status: BOOKING_STATUSES.PENDING }).exec(),
      BookingModel.countDocuments({
        status: BOOKING_STATUSES.PENDING,
        createdAt: { $gte: previousMonthStart, $lt: monthStart },
      }).exec(),
      BillboardModel.aggregate<AggregateCountRow>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).exec(),
      BookingModel.aggregate<{ _id: string; total: number }>([
        {
          $match: {
            status: { $in: REVENUE_BOOKING_STATUSES },
            createdAt: { $gte: chartStart, $lt: chartEnd },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' },
            },
            total: { $sum: '$pricing.total' },
          },
        },
        { $sort: { _id: 1 } },
      ]).exec(),
      BookingModel.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: chartStart, $lt: chartEnd } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]).exec(),
      BookingModel.aggregate<RevenueByCityRow>([
        {
          $match: {
            status: { $in: REVENUE_BOOKING_STATUSES },
            createdAt: { $gte: monthStart, $lt: nextMonthStart },
          },
        },
        { $addFields: { billboardObjectId: { $toObjectId: '$billboardId' } } },
        {
          $lookup: {
            from: 'billboards',
            localField: 'billboardObjectId',
            foreignField: '_id',
            as: 'billboard',
          },
        },
        { $unwind: '$billboard' },
        {
          $group: {
            _id: '$billboard.location.city',
            revenue: { $sum: '$pricing.total' },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 6 },
      ]).exec(),
      BookingModel.aggregate<TopLocationRow>([
        {
          $match: {
            status: { $in: REVENUE_BOOKING_STATUSES },
            createdAt: { $gte: monthStart, $lt: nextMonthStart },
          },
        },
        {
          $group: {
            _id: '$billboardId',
            revenue: { $sum: '$pricing.total' },
            reservations: { $sum: 1 },
          },
        },
        { $addFields: { billboardObjectId: { $toObjectId: '$_id' } } },
        {
          $lookup: {
            from: 'billboards',
            localField: 'billboardObjectId',
            foreignField: '_id',
            as: 'billboard',
          },
        },
        { $unwind: '$billboard' },
        {
          $project: {
            _id: 1,
            revenue: 1,
            reservations: 1,
            billboardName: '$billboard.name',
            city: '$billboard.location.city',
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]).exec(),
      lookupRecentBookings({ status: BOOKING_STATUSES.PENDING }, 4),
      lookupRecentBookings({}, 5),
      lookupRecentBookings({}, 5),
      BillboardModel.aggregate<LiveInventoryCityRow>([
        {
          $group: {
            _id: '$location.city',
            live: {
              $sum: {
                $cond: [{ $eq: ['$status', BILLBOARD_STATUSES.AVAILABLE] }, 1, 0],
              },
            },
            booked: {
              $sum: {
                $cond: [
                  {
                    $in: ['$status', [BILLBOARD_STATUSES.RESERVED, BILLBOARD_STATUSES.OCCUPIED]],
                  },
                  1,
                  0,
                ],
              },
            },
            maintenance: {
              $sum: {
                $cond: [{ $eq: ['$status', BILLBOARD_STATUSES.MAINTENANCE] }, 1, 0],
              },
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { total: -1, _id: 1 } },
        { $limit: 5 },
      ]).exec(),
    ]);

    const totalBillboardsBeforeCurrentMonth = totalBillboardsPreviousMonth;
    const totalBillboardsBeforePreviousMonth = Math.max(
      totalBillboardsBeforeCurrentMonth - totalBillboardsCurrentMonth,
      0,
    );
    const inventoryChange = computeChange(
      totalBillboardsCurrentMonth,
      totalBillboardsBeforePreviousMonth,
    );
    const activeReservationsChange = computeChange(
      activeReservationsCurrent,
      activeReservationsPrevious,
    );
    const revenueChange = computeChange(revenueCurrent, revenuePrevious);
    const pendingApprovalsChange = computeChange(
      pendingApprovalsCurrent,
      pendingApprovalsPreviousMonth,
    );

    const revenueByDate = new Map(revenueSeriesRows.map((row) => [row._id, row.total]));
    const bookingsByDate = new Map(bookingSeriesRows.map((row) => [row._id, row.count]));

    const chartDays = Array.from({ length: 7 }, (_, index) => addUtcDays(chartStart, index));
    const revenueSeries = chartDays.map((day) => {
      const isoDate = formatIsoDate(day);
      return {
        label: formatDayLabel(day),
        revenue: revenueByDate.get(isoDate) ?? 0,
      };
    });
    const bookingSeries = chartDays.map((day) => {
      const isoDate = formatIsoDate(day);
      return {
        label: formatDayLabel(day),
        bookings: bookingsByDate.get(isoDate) ?? 0,
      };
    });

    const inventoryCountByStatus = new Map(inventoryStatusRows.map((row) => [row._id, row.count]));
    const inventoryStatus = INVENTORY_STATUS_ORDER.map((status) => {
      const count = inventoryCountByStatus.get(status) ?? 0;
      return {
        status,
        count,
        share: totalBillboards === 0 ? 0 : Number(((count / totalBillboards) * 100).toFixed(1)),
      };
    });

    const revenueByCity = revenueByCityRows.map((row) => ({
      city: row._id,
      revenue: row.revenue,
      bookings: row.bookings,
      share: revenueCurrent === 0 ? 0 : Number(((row.revenue / revenueCurrent) * 100).toFixed(1)),
    }));

    const pendingApprovalsList = pendingApprovalsRows.map((row) => ({
      id: String(row._id),
      companyName: row.companyName,
      campaignName: row.campaignName,
      billboardName: row.billboardName,
      city: row.city,
      amount: row.amount,
      startDate: formatIsoDate(row.startDate),
      endDate: formatIsoDate(row.endDate),
      createdAt: new Date(row.createdAt).toISOString(),
    }));

    const recentReservations = recentReservationsRows.map((row) => ({
      id: String(row._id),
      companyName: row.companyName,
      campaignName: row.campaignName,
      billboardName: row.billboardName,
      city: row.city,
      amount: row.amount,
      status: row.status as DashboardOverviewResult['recentReservations'][number]['status'],
      createdAt: new Date(row.createdAt).toISOString(),
    }));

    const recentActivity = recentActivityRows.map((row) => ({
      id: String(row._id),
      title:
        row.status === BOOKING_STATUSES.APPROVED
          ? `${row.companyName} was approved`
          : row.status === BOOKING_STATUSES.REJECTED
            ? `${row.companyName} was declined`
            : `${row.companyName} updated a reservation`,
      description: `${row.campaignName} · ${row.billboardName}`,
      timestamp: new Date(row.updatedAt ?? row.createdAt).toISOString(),
      status: row.status as DashboardOverviewResult['recentActivity'][number]['status'],
    }));

    const topLocations = topLocationRows.map((row) => ({
      billboardId: row._id,
      name: row.billboardName,
      city: row.city,
      revenue: row.revenue,
      reservations: row.reservations,
    }));

    const liveInventoryCities = liveInventoryRows.map((row) => ({
      city: row._id,
      live: row.live,
      booked: row.booked,
      maintenance: row.maintenance,
      offline: 0,
      total: row.total,
    }));

    return {
      generatedAt: now.toISOString(),
      periodLabel: formatMonthLabel(now),
      metrics: {
        totalBillboards: {
          value: totalBillboards,
          change: inventoryChange,
          comparisonLabel: 'new inventory vs previous month',
          trend: toTrend(inventoryChange),
        },
        activeReservations: {
          value: activeReservationsCurrent,
          change: activeReservationsChange,
          comparisonLabel: 'active today vs same point last month',
          trend: toTrend(activeReservationsChange),
        },
        revenue: {
          value: revenueCurrent,
          change: revenueChange,
          comparisonLabel: 'recognized this month vs previous month',
          trend: toTrend(revenueChange),
          currency: 'USD',
        },
        pendingApprovals: {
          value: pendingApprovalsCurrent,
          change: pendingApprovalsChange,
          comparisonLabel: 'new requests vs previous month',
          trend: toTrend(pendingApprovalsChange),
        },
      },
      revenueSeries,
      bookingSeries,
      revenueByCity,
      inventoryStatus,
      topLocations,
      pendingApprovalsList,
      recentReservations,
      recentActivity,
      liveInventoryCities,
    };
  },
};
