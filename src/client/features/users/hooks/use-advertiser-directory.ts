'use client';

import { useQuery } from '@tanstack/react-query';
import { advertiserDirectoryClientService } from '@/client/features/users/services/advertiser-directory-client.service';

export function useAdvertiserDirectory() {
  return useQuery({
    queryKey: ['admin-advertiser-directory'],
    queryFn: () => advertiserDirectoryClientService.getDirectory(),
  });
}
