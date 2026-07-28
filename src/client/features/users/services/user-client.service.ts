import { apiRequest } from '@/client/ui/lib/api-client';
import type { UpdateUserInfoSchemaInput } from '@/shared/contracts/user/user.schema';
import type { User } from '@/shared/types/user';

export const userClientService = {
  /** Session-backed identity; the id it returns is what `updateProfile` needs. */
  async getCurrentUser() {
    return apiRequest<{ user: User | null }>('/api/v1/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
  },

  async updateProfile(userId: string, data: UpdateUserInfoSchemaInput) {
    return apiRequest<User>('/api/v1/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: userId, data }),
    });
  },
};
