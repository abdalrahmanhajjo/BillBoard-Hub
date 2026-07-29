import Link from 'next/link';

type DashboardLinkCardProps = {
  title: string;
  description: string;
  href: string;
};

export function DashboardLinkCard({ title, description, href }: DashboardLinkCardProps) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>
    </Link>
  );
}
