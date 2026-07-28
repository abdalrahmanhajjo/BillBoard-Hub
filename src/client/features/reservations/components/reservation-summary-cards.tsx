'use client';

import { Badge } from '@/client/ui/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/ui/components/ui/card';
import type { ReservationTab } from '../hooks/use-reservations';

interface SummaryCounts {
  total: number;
  pending: number;
  running: number;
  completed: number;
  cancelled: number;
}

interface ReservationSummaryCardsProps {
  summary: SummaryCounts;
  onFilterClick: (tab: ReservationTab) => void;
}

const CARD_CONFIG: Array<{
  key: keyof SummaryCounts;
  label: string;
  badge: 'default' | 'success' | 'outline' | 'destructive' | null;
  tab: ReservationTab;
  color: string;
}> = [
  { key: 'total', label: 'Total', badge: null, tab: 'all', color: '' },
  {
    key: 'pending',
    label: 'Pending',
    badge: 'default',
    tab: 'active',
    color: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'running',
    label: 'Running',
    badge: 'success',
    tab: 'active',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'completed',
    label: 'Completed',
    badge: 'outline',
    tab: 'completed',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    badge: 'destructive',
    tab: 'cancelled',
    color: 'text-red-600 dark:text-red-400',
  },
];

export function ReservationSummaryCards({ summary, onFilterClick }: ReservationSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARD_CONFIG.map((config) => (
        <button
          key={config.key}
          type="button"
          onClick={() => onFilterClick(config.tab)}
          className="focus-visible:ring-ring text-left transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Card size="sm" className="cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-normal">{config.label}</span>
                {config.badge && <Badge variant={config.badge}>{summary[config.key]}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-2xl font-semibold tracking-tight ${config.color}`}>
                {summary[config.key]}
              </span>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}
