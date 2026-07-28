import { uploadImageKitAsset } from '@/client/features/uploads/services/imagekit-upload.service';

/** Uploads a creative asset (image or video) to ImageKit; resolves to its URL. */
export async function uploadCreativeAsset(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return uploadImageKitAsset(
    file,
    {
      folder: '/creatives',
      missingUrlMessage: 'Upload did not return an asset URL.',
      failureMessage: 'We could not upload this creative. Check the file and try again.',
    },
    onProgress,
  );
}
