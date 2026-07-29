import type { LucideIcon } from 'lucide-react';

type SettingsRowProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** A control or link; omit for a row that only reports state. */
  action?: React.ReactNode;
};

/**
 * One line of a settings screen. Shared by the advertiser and admin areas so
 * both settings pages read as the same surface.
 */
export function SettingsRow({ icon: Icon, title, description, action }: SettingsRowProps) {
  return (
    <div className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-medium">{title}</p>
          <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
