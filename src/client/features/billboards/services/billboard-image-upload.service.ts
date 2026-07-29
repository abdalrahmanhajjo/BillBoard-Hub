import { uploadImageKitAsset } from '@/client/features/uploads/services/imagekit-upload.service';

/**
 * Uploads a single file directly to ImageKit (via short-lived server creds)
 * and resolves to the hosted CDN URL to store in `images[]`.
 */
export async function uploadBillboardImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return uploadImageKitAsset(
    file,
    {
      folder: '/billboards',
      missingUrlMessage: 'Upload did not return an image URL.',
      failureMessage: 'We could not upload this image. Check the file and try again.',
    },
    onProgress,
  );
}
