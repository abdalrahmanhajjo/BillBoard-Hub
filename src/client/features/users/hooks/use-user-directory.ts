'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userDirectoryClientService } from '@/client/features/users/services/user-directory-client.service';
import type { UpdateUserAccessSchemaInput } from '@/shared/contracts/user/user-access.schema';

const USER_DIRECTORY_KEY = ['admin-user-directory'];

export function useUserDirectory() {
  return useQuery({
    queryKey: USER_DIRECTORY_KEY,
    queryFn: () => userDirectoryClientService.getDirectory(),
  });
}

/**
 * Role and activation changes. The advertiser directory is invalidated too:
 * deactivating an account or flipping its role changes who belongs there.
 */
export function useUpdateUserAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateUserAccessSchemaInput }) =>
      userDirectoryClientService.updateAccess(userId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USER_DIRECTORY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['admin-advertiser-directory'] }),
      ]);
    },
  });
}
