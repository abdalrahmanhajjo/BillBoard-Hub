import { MAX_CREATIVE_VIDEO_DURATION_SECONDS } from '@/shared/constants/ad-creative';

/** Reads the real duration from a browser-selected video before it is uploaded. */
export function readVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);

    const cleanUp = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
    };

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanUp();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(
          new Error('We could not read this video duration. Try another MP4, WebM, or MOV file.'),
        );
        return;
      }

      resolve(duration);
    };
    video.onerror = () => {
      cleanUp();
      reject(new Error('We could not read this video. Try another MP4, WebM, or MOV file.'));
    };
    video.src = objectUrl;
  });
}

export function isVideoDurationAllowed(durationSeconds: number): boolean {
  return durationSeconds > 0 && durationSeconds < MAX_CREATIVE_VIDEO_DURATION_SECONDS;
}
