'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadBillboardImage } from '@/client/features/billboards/services/billboard-image-upload.service';

type BillboardImageInputProps = {
  value: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
};

const MAX_IMAGES = 12;
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function BillboardImageInput({ value, onChange, disabled }: BillboardImageInputProps) {
  const [draft, setDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = Boolean(disabled) || uploading;

  const addUrl = () => {
    const url = draft.trim();
    if (!url || value.includes(url)) {
      setDraft('');
      return;
    }
    if (value.length >= MAX_IMAGES) {
      setError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    onChange([...value, url]);
    setDraft('');
  };

  const removeImage = (url: string) => {
    onChange(value.filter((image) => image !== url));
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);

    const slots = MAX_IMAGES - value.length;
    if (slots <= 0) {
      setError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }

    const files = Array.from(fileList).slice(0, slots);
    setUploading(true);
    setProgress(0);
    const added: string[] = [];

    try {
      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError('Only JPG, PNG, or WebP images are allowed.');
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`Each image must be under ${MAX_SIZE_MB}MB.`);
          continue;
        }
        const url = await uploadBillboardImage(file, setProgress);
        if (!value.includes(url) && !added.includes(url)) added.push(url);
      }
      if (added.length) onChange([...value, ...added]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'We could not upload the images. Check the files and try again.',
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!busy) void handleFiles(event.dataTransfer.files);
        }}
        className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/60 p-4 text-center"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          disabled={busy}
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <Upload className="mx-auto size-6 text-zinc-400" aria-hidden />
        <p className="mt-2 text-sm text-zinc-600">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="font-medium text-blue-600 hover:underline disabled:opacity-60"
          >
            {uploading ? `Uploading… ${progress}%` : 'Upload images'}
          </button>{' '}
          or drag &amp; drop
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          JPG, PNG, or WebP · up to {MAX_SIZE_MB}MB · max {MAX_IMAGES} images
        </p>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-zinc-500">Or add an image by URL</summary>
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addUrl();
              }
            }}
            placeholder="https://…/billboard.jpg"
            disabled={busy}
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={busy}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </details>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((url) => (
            <li key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Billboard"
                className="h-20 w-20 rounded-md border border-zinc-200 object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                disabled={busy}
                aria-label="Remove image"
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white disabled:opacity-60"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
