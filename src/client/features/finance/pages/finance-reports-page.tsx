'use client';

import { Download, RefreshCw, TrendingUp } from 'lucide-react';
import { Badge } from '@/client/ui/components/ui/badge';
import { Button } from '@/client/ui/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/ui/components/ui/table';
import {
  EmptyState,
  SectionCard,
  StatCard,
  WorkspaceError,
  WorkspacePage,
  WorkspaceSkeleton,
} from '@/client/features/dashboard/components/workspace-page';
import { buildCsv, downloadCsv } from '@/client/features/dashboard/utils/csv-export';
import { useFinanceOverview } from '@/client/features/finance/hooks/use-finance-overview';
import { money, moneyExact, percent } from '@/client/features/finance/lib/format';
import type { BillboardProfitability } from '@/shared/types/finance';

export function FinanceReportsPage() {
  const { overview, status, error, reload } = useFinanceOverview();

  const exportCsv = () => {
    if (!overview) return;

    const csv = buildCsv<BillboardProfitability>(overview.billboards, [
      { header: 'Billboard', value: (row) => row.name },
      { header: 'City', value: (row) => row.city },
      { header: 'Type', value: (row) => row.type },
      { header: 'Reservations', value: (row) => row.bookings },
      { header: 'Occupancy %', value: (row) => (row.occupancyRate * 100).toFixed(1) },
      { header: `Revenue (${overview.baseCurrency})`, value: (row) => row.revenue.toFixed(2) },
      { header: `Expenses (${overview.baseCurrency})`, value: (row) => row.expenses.toFixed(2) },
      { header: `Net profit (${overview.baseCurrency})`, value: (row) => row.netProfit.toFixed(2) },
      { header: 'Margin %', value: (row) => (row.margin === null ? '' : row.margin.toFixed(1)) },
    ]);

    downloadCsv(
      `billboard-profitability-${overview.window.from}-to-${overview.window.to}.csv`,
      csv,
    );
  };

  const mostProfitable = overview?.billboards[0];
  const leastProfitable = overview?.billboards.at(-1);

  return (
    <WorkspacePage
      eyebrow="Finance"
      title="Profitability"
      description="What each billboard earns after the costs booked against it, plus the month-by-month revenue and expense ledger."
      actions={
        <>
          <Button variant="outline" onClick={reload} disabled={status === 'loading'}>
            <RefreshCw
              className={status === 'loading' ? 'size-4 animate-spin' : 'size-4'}
              aria-hidden
            />
            Refresh
          </Button>
          <Button onClick={exportCsv} disabled={!overview || overview.billboards.length === 0}>
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
        </>
      }
      canvas
    >
      {status === 'loading' ? <WorkspaceSkeleton /> : null}
      {status === 'error' ? (
        <WorkspaceError message={error ?? 'Unknown finance error.'} onRetry={reload} />
      ) : null}

      {status === 'ready' && overview ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              index={0}
              icon={TrendingUp}
              accent="bg-emerald-50 text-emerald-700"
              label="Gross profit"
              value={money(overview.profit.gross)}
              hint="After direct billboard costs"
            />
            <StatCard
              index={1}
              icon={TrendingUp}
              accent={
                overview.profit.net >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
              }
              label="Net profit"
              value={money(overview.profit.net)}
              hint="After all overhead"
            />
            <StatCard
              index={2}
              icon={TrendingUp}
              accent="bg-cyan-50 text-cyan-700"
              label="Most profitable"
              value={mostProfitable ? money(mostProfitable.netProfit) : '—'}
              hint={mostProfitable?.name ?? 'No data'}
            />
            <StatCard
              index={3}
              icon={TrendingUp}
              accent="bg-amber-50 text-amber-700"
              label="Highest cost"
              value={
                overview.billboards.length > 0
                  ? money(Math.max(...overview.billboards.map((row) => row.expenses)))
                  : '—'
              }
              hint={
                leastProfitable && leastProfitable.netProfit < 0
                  ? `${leastProfitable.name} is loss-making`
                  : 'All placements positive'
              }
            />
          </div>

          <SectionCard
            title="Billboard profitability"
            description={`Revenue, cost, and margin per placement between ${overview.window.from} and ${overview.window.to}.`}
            bodyClassName="px-0 pb-0"
          >
            {overview.billboards.length === 0 ? (
              <div className="px-5 pb-5">
                <EmptyState
                  icon={TrendingUp}
                  title="Nothing to report yet"
                  description="Link expenses to billboards and approve reservations to build this table."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Billboard</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Occupancy</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Net profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.billboards.map((row) => (
                      <TableRow key={row.billboardId}>
                        <TableCell>
                          <p className="font-medium">{row.name}</p>
                          <p className="text-muted-foreground text-xs capitalize">
                            {row.city} · {row.type}
                          </p>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{row.bookings}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {(row.occupancyRate * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {moneyExact(row.revenue)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {moneyExact(row.expenses)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={row.netProfit >= 0 ? 'success' : 'destructive'}>
                            {moneyExact(row.netProfit)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right tabular-nums">
                          {percent(row.margin)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Monthly ledger"
              description="Revenue against expenses, month by month."
              bodyClassName="px-0 pb-0"
            >
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.monthly.map((point) => (
                      <TableRow key={point.month}>
                        <TableCell className="font-medium">{point.label}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {money(point.revenue)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {money(point.expenses)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium tabular-nums ${
                            point.profit < 0 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {money(point.profit)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>

            <SectionCard
              title="Expense categories"
              description="Where the money goes, largest first."
              bodyClassName="px-0 pb-0"
            >
              {overview.byCategory.length === 0 ? (
                <div className="px-5 pb-5">
                  <EmptyState
                    icon={TrendingUp}
                    title="No expenses recorded"
                    description="Categories appear once costs are entered."
                  />
                </div>
              ) : (
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead className="text-right">Records</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.byCategory.map((row) => (
                        <TableRow key={row.category}>
                          <TableCell className="font-medium capitalize">{row.label}</TableCell>
                          <TableCell className="text-muted-foreground text-xs capitalize">
                            {row.group}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {moneyExact(row.baseAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      ) : null}
    </WorkspacePage>
  );
}
