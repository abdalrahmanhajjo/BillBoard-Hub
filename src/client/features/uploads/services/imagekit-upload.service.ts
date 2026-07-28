import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from '@imagekit/next';
import { apiRequest } from '@/client/ui/lib/api-client';

type ImageKitAuthParams = {
  token: string;
  signature: string;
  expire: number;
  publicKey: string;
};

type UploadAssetOptions = {
  folder: `/${string}`;
  missingUrlMessage: string;
  failureMessage: string;
};

async function fetchAuthParams(): Promise<ImageKitAuthParams> {
  const result = await apiRequest<ImageKitAuthParams>('/api/v1/uploads/imagekit-auth', {
    credentials: 'include',
  });

  if (!result.ok || !result.data) {
    throw new Error(
      result.error ?? 'Uploads are temporarily unavailable. Refresh the page and try again.',
    );
  }

  return result.data;
}

/**
 * Uploads a file directly to ImageKit using short-lived server credentials.
 * Feature-specific wrappers select the destination folder and user-facing copy.
 */
export async function uploadImageKitAsset(
  file: File,
  options: UploadAssetOptions,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const { token, signature, expire, publicKey } = await fetchAuthParams();

  try {
    const result = await upload({
      file,
      fileName: file.name,
      token,
      signature,
      expire,
      publicKey,
      folder: options.folder,
      useUniqueFileName: true,
      onProgress: onProgress
        ? (event) => {
            if (event.total > 0) onProgress(Math.round((event.loaded / event.total) * 100));
          }
        : undefined,
    });

    if (!result.url) {
      throw new Error(options.missingUrlMessage);
    }

    return result.url;
  } catch (error) {
    if (
      error instanceof ImageKitAbortError ||
      error instanceof ImageKitInvalidRequestError ||
      error instanceof ImageKitServerError ||
      error instanceof ImageKitUploadNetworkError
    ) {
      throw new Error(error.message || options.failureMessage);
    }
    throw error;
  }
}
