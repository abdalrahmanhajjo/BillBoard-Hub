'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';
import { userDirectoryClientService } from '@/client/features/users/services/user-directory-client.service';
import type { Campaign, CampaignStatus } from '@/shared/types/campaign';

const ADMIN_CAMPAIGNS_KEY = ['admin-campaigns'];

/**
 * `GET /campaigns` already returns every campaign to an admin, so the directory
 * needs no dedicated endpoint — only the owner names, which come from the user
 * directory the admin can already read.
 */
export function useAdminCampaigns() {
  return useQuery({
    queryKey: ADMIN_CAMPAIGNS_KEY,
    queryFn: async () => {
      const result = await campaignClientService.list();

      if (!result.ok) {
        throw new Error(result.error ?? 'Campaigns are unavailable.');
      }

      return (result.data as { campaigns?: Campaign[] } | undefined)?.campaigns ?? [];
    },
  });
}

/** Owner id → display name, so the table can show who each campaign belongs to. */
export function useCampaignOwners() {
  return useQuery({
    queryKey: ['admin-user-directory'],
    queryFn: () => userDirectoryClientService.getDirectory(),
  });
}

export function useModerateCampaignStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, status }: { campaignId: string; status: CampaignStatus }) => {
      const result = await campaignClientService.moderateStatus(campaignId, { status });

      if (!result.ok) {
        throw new Error(result.error ?? 'The campaign status could not be updated.');
      }

      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_CAMPAIGNS_KEY });
    },
  });
}
