import type { ReactNode } from "react";

type DashboardShellProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function DashboardShell({
  title,
  subtitle,
  actions,
  children,
}: DashboardShellProps) {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-zinc-600">{subtitle}</p>
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>

      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
