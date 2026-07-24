import { cn } from '@/client/ui/lib/utils';

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-25',
        className,
      )}
    >
      {children}
    </div>
  );
}
