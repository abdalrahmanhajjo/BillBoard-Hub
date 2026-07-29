import type {
  AdvertiserDirectory,
  AdvertiserDirectoryResponse,
} from '@/shared/types/advertiser-directory';

export const advertiserDirectoryClientService = {
  async getDirectory(): Promise<AdvertiserDirectory> {
    const response = await fetch('/api/v1/user/advertisers', {
      method: 'GET',
      credentials: 'include',
    });

    const payload = (await response.json()) as AdvertiserDirectoryResponse;

    if (!response.ok || !payload.ok || !payload.data?.directory) {
      throw new Error(
        payload.ok ? 'Advertiser data is unavailable.' : (payload.message ?? 'Request failed.'),
      );
    }

    return payload.data.directory;
  },
};
