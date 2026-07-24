const AVAILABILITY_STYLES = {
  available: 'border-green-200 bg-green-50 text-green-700',
  unavailable: 'border-zinc-200 bg-zinc-100 text-zinc-600',
} as const;

/**
 * Public-safe availability badge. Only exposes "Available" / "Unavailable" so
 * the internal reserved/occupied/maintenance status is never leaked to visitors.
 */
export function BillboardAvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  const styles = isAvailable ? AVAILABILITY_STYLES.available : AVAILABILITY_STYLES.unavailable;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      {isAvailable ? 'Available' : 'Unavailable'}
    </span>
  );
}
