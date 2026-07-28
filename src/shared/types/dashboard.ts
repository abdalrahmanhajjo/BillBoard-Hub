import type { BillboardStatus } from '@/shared/types/billboard';
import type { BookingStatus } from '@/shared/types/booking';
import type { ApiResponse } from '@/shared/types/response';

export type DashboardTrend = 'up' | 'down' | 'flat';

export type DashboardMetric = {
  value: number;
  change: number;
  comparisonLabel: string;
  trend: DashboardTrend;
};

export type DashboardRevenueMetric = DashboardMetric & {
  currency: string;
};

export type RevenueSeriesPoint = {
  label: string;
  revenue: number;
};

export type BookingSeriesPoint = {
  label: string;
  bookings: number;
};

export type RevenueByCityPoint = {
  city: string;
  revenue: number;
  bookings: number;
  share: number;
};

export type InventoryStatusPoint = {
  status: BillboardStatus;
  count: number;
  share: number;
};

export type TopLocationRow = {
  billboardId: string;
  name: string;
  city: string;
  revenue: number;
  reservations: number;
};

export type PendingApprovalItem = {
  id: string;
  companyName: string;
  campaignName: string;
  billboardName: string;
  city: string;
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type RecentReservationItem = {
  id: string;
  companyName: string;
  campaignName: string;
  billboardName: string;
  city: string;
  amount: number;
  status: BookingStatus;
  createdAt: string;
};

export type RecentActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: BookingStatus;
};

export type LiveInventoryCity = {
  city: string;
  live: number;
  booked: number;
  maintenance: number;
  offline: number;
  total: number;
};

export type AdminDashboardOverview = {
  generatedAt: string;
  periodLabel: string;
  metrics: {
    totalBillboards: DashboardMetric;
    activeReservations: DashboardMetric;
    revenue: DashboardRevenueMetric;
    pendingApprovals: DashboardMetric;
  };
  revenueSeries: RevenueSeriesPoint[];
  bookingSeries: BookingSeriesPoint[];
  revenueByCity: RevenueByCityPoint[];
  inventoryStatus: InventoryStatusPoint[];
  topLocations: TopLocationRow[];
  pendingApprovalsList: PendingApprovalItem[];
  recentReservations: RecentReservationItem[];
  recentActivity: RecentActivityItem[];
  liveInventoryCities: LiveInventoryCity[];
};

export type AdminDashboardOverviewResponse = ApiResponse<{
  overview: AdminDashboardOverview;
}>;
