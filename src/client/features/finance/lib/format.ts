import { FINANCE_BASE_CURRENCY } from '@/shared/constants/finance';

/** Money in the reporting currency, e.g. `$4,000`. */
export function money(value: number, currency: string = FINANCE_BASE_CURRENCY): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: Math.abs(value) >= 1000 ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

/** Full precision, for tables where cents matter. */
export function moneyExact(value: number, currency: string = FINANCE_BASE_CURRENCY): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function percent(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(1)}%`;
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function titleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}
