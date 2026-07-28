'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { Film, ImageIcon, Upload } from 'lucide-react';
import { CREATIVE_TYPES, MAX_CREATIVE_VIDEO_DURATION_SECONDS } from '@/shared/constants/creative';
import type { CreativeType } from '@/shared/types/creative';
import { uploadCreativeAsset } from '@/client/features/creatives/services/creative-upload.service';
import { creativeClientService } from '@/client/features/creatives/services/creative-client.service';
import {
  isVideoDurationAllowed,
  readVideoDurationSeconds,
} from '@/client/features/creatives/utils/video-metadata';

const ACCEPTED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];
const ACCEPTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];
const MAX_SIZE_MB = 50;

const inputClassName = 'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm';

export function CreativeUploadForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [type, setType] = useState<CreativeType | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = uploading || isPending;
  const isVideo = type === CREATIVE_TYPES.VIDEO;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const image = ACCEPTED_IMAGE.includes(file.type);
    const video =
      ACCEPTED_VIDEO.includes(file.type) ||
      ACCEPTED_VIDEO_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension));
    if (!image && !video) {
      setError('Upload a JPG, PNG, WebP, GIF, MP4, WebM, or MOV file.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const videoDuration = video ? await readVideoDurationSeconds(file) : null;
      if (videoDuration !== null && !isVideoDurationAllowed(videoDuration)) {
        setError(
          `Video must be shorter than ${MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds. This file is ${videoDuration.toFixed(1)} seconds.`,
        );
        return;
      }

      const url = await uploadCreativeAsset(file, setProgress);
      setAssetUrl(url);
      setType(video ? CREATIVE_TYPES.VIDEO : CREATIVE_TYPES.IMAGE);
      setDuration(videoDuration);
      if (!name.trim()) setName(file.name.replace(/\.[^.]+$/, ''));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'We could not upload this creative. Check the file and try again.',
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!assetUrl || !type) {
      setError('Upload a creative file first.');
      return;
    }

    startTransition(async () => {
      const result = await creativeClientService.create({
        name,
        type,
        assetUrl,
        durationSeconds: isVideo ? (duration ?? undefined) : undefined,
      });
      if (!result.ok) {
        setError(
          result.error ?? 'We could not add this creative. Review the details and try again.',
        );
        return;
      }
      setName('');
      setAssetUrl('');
      setType(null);
      setDuration(null);
      onCreated?.();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!busy) void handleFile(event.dataTransfer.files[0]);
        }}
        className="relative overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50/60 p-4 text-center"
      >
        <input
          ref={inputRef}
          type="file"
          accept={[...ACCEPTED_IMAGE, ...ACCEPTED_VIDEO, ...ACCEPTED_VIDEO_EXTENSIONS].join(',')}
          hidden
          disabled={busy}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />

        {assetUrl ? (
          <div className="mx-auto max-w-xs">
            {isVideo ? (
              <video src={assetUrl} className="aspect-video w-full rounded-md object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={assetUrl}
                alt="Creative preview"
                className="aspect-video w-full rounded-md object-cover"
              />
            )}
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              {isVideo ? <Film className="size-3.5" /> : <ImageIcon className="size-3.5" />}
              Uploaded — {isVideo && duration ? `video · ${duration.toFixed(1)}s` : 'image'}
            </p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto size-6 text-zinc-400" aria-hidden />
            <p className="mt-2 text-sm text-zinc-600">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="font-medium text-blue-600 hover:underline disabled:opacity-60"
              >
                {uploading ? `Uploading… ${progress}%` : 'Upload a creative'}
              </button>{' '}
              or drag &amp; drop
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Image or video (JPG, PNG, WebP, GIF, MP4, WebM, MOV) · up to {MAX_SIZE_MB}MB
            </p>
            <p className="mt-1 text-xs font-medium text-blue-600">
              Videos must be shorter than {MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds.
            </p>
          </>
        )}
      </div>

      {assetUrl ? (
        <button
          type="button"
          onClick={() => {
            setAssetUrl('');
            setType(null);
            setDuration(null);
          }}
          className="text-xs text-zinc-500 hover:text-zinc-800"
        >
          Replace file
        </button>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="creative-name" className="text-sm font-medium">
          Creative name
        </label>
        <input
          id="creative-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
          placeholder="Spring campaign — hero"
        />
      </div>

      <button
        type="submit"
        disabled={busy || !assetUrl}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Add creative'}
      </button>
    </form>
  );
}
