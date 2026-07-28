import type {
  AdminDashboardOverview,
  AdminDashboardOverviewResponse,
} from '@/shared/types/dashboard';

export const adminDashboardClientService = {
  async getOverview(): Promise<AdminDashboardOverview> {
    const response = await fetch('/api/v1/dashboard/admin/overview', {
      method: 'GET',
      credentials: 'include',
    });

    const payload = (await response.json()) as AdminDashboardOverviewResponse;

    if (!response.ok || !payload.ok || !payload.data?.overview) {
      throw new Error(payload.ok ? 'Dashboard data is unavailable.' : payload.message);
    }

    return payload.data.overview;
  },
};
