import { Button } from '@/client/ui/components/ui/button';

type ReserveButtonProps = {
  isAvailable: boolean;
  href?: string;
  label?: string;
};

export function ReserveButton({
  isAvailable,
  href = '#campaign-inquiry',
  label = 'Reserve this billboard',
}: ReserveButtonProps) {
  if (!isAvailable) {
    return (
      <Button
        type="button"
        disabled
        className="min-h-12 w-full rounded-xl bg-zinc-200 px-4 text-sm font-semibold text-zinc-500"
      >
        Currently unavailable
      </Button>
    );
  }

  return (
    <Button
      render={<a href={href} />}
      nativeButton={false}
      className="min-h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
    >
      {label}
    </Button>
  );
}
