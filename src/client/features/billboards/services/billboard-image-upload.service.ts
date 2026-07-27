import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from '@imagekit/next';

type ImageKitAuthParams = {
  token: string;
  signature: string;
  expire: number;
  publicKey: string;
};

async function fetchAuthParams(): Promise<ImageKitAuthParams> {
  const response = await fetch('/api/v1/uploads/imagekit-auth', { credentials: 'include' });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error ?? 'Image upload is not available right now.');
  }

  return payload.data as ImageKitAuthParams;
}

/**
 * Uploads a single file directly to ImageKit (via short-lived server creds)
 * and resolves to the hosted CDN URL to store in `images[]`.
 */
export async function uploadBillboardImage(
  file: File,
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
      folder: '/billboards',
      useUniqueFileName: true,
      onProgress: onProgress
        ? (event) => {
            if (event.total > 0) onProgress(Math.round((event.loaded / event.total) * 100));
          }
        : undefined,
    });

    if (!result.url) {
      throw new Error('Upload did not return an image URL.');
    }

    return result.url;
  } catch (error) {
    if (
      error instanceof ImageKitAbortError ||
      error instanceof ImageKitInvalidRequestError ||
      error instanceof ImageKitServerError ||
      error instanceof ImageKitUploadNetworkError
    ) {
      throw new Error(error.message || 'Image upload failed. Please try again.');
    }
    throw error;
  }
}
