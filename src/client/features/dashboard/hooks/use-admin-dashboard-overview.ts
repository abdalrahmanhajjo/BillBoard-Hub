'use client';

import { useQuery } from '@tanstack/react-query';
import { adminDashboardClientService } from '@/client/features/dashboard/services/admin-dashboard-client.service';

export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: () => adminDashboardClientService.getOverview(),
  });
}
