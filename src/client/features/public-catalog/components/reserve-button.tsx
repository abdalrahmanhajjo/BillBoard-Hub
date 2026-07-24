'use client';

import { useState } from 'react';

/**
 * Visible reservation call-to-action for the billboard details page.
 *
 * The reservation/booking flow is delivered by a separate epic, so this button
 * is intentionally a placeholder: it is disabled when the billboard is not
 * available and acknowledges the click otherwise. Wire it to the booking flow
 * once that module exists.
 */
export function ReserveButton({ isAvailable }: { isAvailable: boolean }) {
  const [showNotice, setShowNotice] = useState(false);

  if (!isAvailable) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-md bg-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 sm:w-auto"
      >
        Currently unavailable
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setShowNotice(true)}
        className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
      >
        Reserve this billboard
      </button>
      {showNotice ? (
        <p className="text-sm text-zinc-600" role="status">
          Thanks for your interest — online reservations are coming soon.
        </p>
      ) : null}
    </div>
  );
}
