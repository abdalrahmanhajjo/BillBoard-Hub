import Link from 'next/link';
import type { FooterColumnData } from '@/client/features/home/home.types';

export function FooterColumn({ column }: { column: FooterColumnData }) {
  return (
    <nav className="space-y-3">
      <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
        {column.title}
      </h3>
      <ul className="space-y-2">
        {column.links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
