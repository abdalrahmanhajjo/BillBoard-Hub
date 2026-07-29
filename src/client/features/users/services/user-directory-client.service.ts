import type { UpdateUserAccessSchemaInput } from '@/shared/contracts/user/user-access.schema';
import type { ApiResponse } from '@/shared/types/response';
import type { UserDirectory, UserDirectoryResponse } from '@/shared/types/user-directory';
import type { User } from '@/shared/types/user';

export const userDirectoryClientService = {
  async getDirectory(): Promise<UserDirectory> {
    const response = await fetch('/api/v1/user', {
      method: 'GET',
      credentials: 'include',
    });

    const payload = (await response.json()) as UserDirectoryResponse;

    if (!response.ok || !payload.ok || !payload.data?.directory) {
      throw new Error(
        payload.ok ? 'User data is unavailable.' : (payload.message ?? 'Request failed.'),
      );
    }

    return payload.data.directory;
  },

  async updateAccess(userId: string, input: UpdateUserAccessSchemaInput): Promise<User> {
    const response = await fetch(`/api/v1/user/${userId}/access`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as ApiResponse<User>;

    if (!response.ok || !payload.ok || !payload.data) {
      throw new Error(
        payload.ok ? 'The account could not be updated.' : (payload.message ?? 'Request failed.'),
      );
    }

    return payload.data;
  },
};
