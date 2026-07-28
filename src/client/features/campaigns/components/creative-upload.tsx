'use client';

import { useRef, useState } from 'react';
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitUploadNetworkError,
} from '@imagekit/next';

import { Button } from '@/client/ui/components/ui/button';
import { adCreativeClientService } from '@/client/features/campaigns/services/ad-creative-client.service';
import { AD_CREATIVE_TYPES } from '@/shared/constants/ad-creative';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm'];

type CreativeUploadProps = {
  campaignId: string;
  onUploaded: () => void | Promise<void>;
};

function getVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error('Could not read video duration.'));
    video.src = URL.createObjectURL(file);
  });
}

export function CreativeUpload({ campaignId, onUploaded }: CreativeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Upload an image (PNG/JPEG/WEBP) or video (MP4/WEBM).');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      setError(`File is too large. Max size is ${Math.round(maxBytes / (1024 * 1024))}MB.`);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const authResult = await adCreativeClientService.getUploadAuthParams();
      if (!authResult.ok) {
        throw new Error(authResult.error ?? 'Could not authorize the upload.');
      }
      const { token, signature, expire, publicKey } = authResult.data as {
        token: string;
        signature: string;
        expire: number;
        publicKey: string;
      };

      const uploadResponse = await upload({
        file,
        fileName: file.name,
        token,
        signature,
        expire,
        publicKey,
        onProgress: (progressEvent) =>
          setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100)),
      });

      const durationSeconds = isVideo
        ? await getVideoDurationSeconds(file).catch(() => undefined)
        : undefined;

      const createResult = await adCreativeClientService.create(campaignId, {
        campaignId,
        url: uploadResponse.url ?? '',
        fileType: isVideo ? AD_CREATIVE_TYPES.VIDEO : AD_CREATIVE_TYPES.IMAGE,
        durationSeconds,
        fileSizeBytes: file.size,
      });

      if (!createResult.ok) {
        throw new Error(createResult.error ?? 'Saving creative failed.');
      }

      await onUploaded();
    } catch (err) {
      if (err instanceof ImageKitAbortError) {
        setError('Upload was cancelled.');
      } else if (err instanceof ImageKitInvalidRequestError) {
        setError(`Upload rejected: ${err.message}`);
      } else if (err instanceof ImageKitUploadNetworkError) {
        setError('Network error during upload. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelected}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? `Uploading… ${progress}%` : 'Upload creative'}
      </Button>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
