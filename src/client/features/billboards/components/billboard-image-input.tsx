'use client';

import { useState } from 'react';

type BillboardImageInputProps = {
  value: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
};

/**
 * Stores billboard image URLs (the shape UploadThing/S3 returns after upload).
 *
 * UploadThing drop-in: once the `uploadthing` dependency and UPLOADTHING_TOKEN
 * are configured, replace the URL field below with:
 *
 *   <UploadDropzone
 *     endpoint="billboardImage"
 *     onClientUploadComplete={(files) =>
 *       onChange([...value, ...files.map((file) => file.ufsUrl)])
 *     }
 *   />
 *
 * The rest of the form and the persisted `images: string[]` field stay unchanged.
 */
export function BillboardImageInput({ value, onChange, disabled }: BillboardImageInputProps) {
  const [draft, setDraft] = useState('');

  const addImage = () => {
    const url = draft.trim();
    if (!url || value.includes(url)) {
      setDraft('');
      return;
    }

    onChange([...value, url]);
    setDraft('');
  };

  const removeImage = (url: string) => {
    onChange(value.filter((image) => image !== url));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="url"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addImage();
            }
          }}
          placeholder="https://…/billboard.jpg"
          disabled={disabled}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
        <button
          type="button"
          onClick={addImage}
          disabled={disabled}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
        >
          Add
        </button>
      </div>

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
                disabled={disabled}
                aria-label="Remove image"
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white disabled:opacity-60"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
