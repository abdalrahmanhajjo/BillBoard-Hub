'use client';

import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  Banknote,
  CircleDollarSign,
  PiggyBank,
  Receipt,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
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
import { useFinanceOverview } from '@/client/features/finance/hooks/use-finance-overview';
import { money, percent } from '@/client/features/finance/lib/format';
import { ADMIN_ROUTES } from '@/shared/constants/routes';

const CATEGORY_COLORS = [
  '#2563eb',
  '#22c55e',
  '#f59e0b',
  '#f43f5e',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#ec4899',
];

export function FinanceDashboardPage() {
  const { overview, status, error, reload } = useFinanceOverview();

  const actions = (
    <>
      <Button variant="outline" onClick={reload} disabled={status === 'loading'}>
        <RefreshCw
          className={status === 'loading' ? 'size-4 animate-spin' : 'size-4'}
          aria-hidden
        />
        Refresh
      </Button>
      <Button render={<Link href={ADMIN_ROUTES.FINANCE_EXPENSES} />} nativeButton={false}>
        Record expense
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </>
  );

  return (
    <WorkspacePage
      eyebrow="Finance"
      title="What the network costs, and what it earns"
      description="Company-side operating costs measured against advertiser revenue. Separate from customer invoices and reservation payments."
      actions={actions}
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
              icon={CircleDollarSign}
              accent="bg-emerald-50 text-emerald-700"
              label="Revenue"
              value={money(overview.revenue.total)}
              hint={`${money(overview.revenue.currentMonth)} this month`}
            />
            <StatCard
              index={1}
              icon={Receipt}
              accent="bg-rose-50 text-rose-700"
              label="Expenses"
              value={money(overview.expenses.total)}
              hint={`${money(overview.expenses.pending)} still unpaid`}
            />
            <StatCard
              index={2}
              icon={PiggyBank}
              accent={
                overview.profit.net >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
              }
              label="Net profit"
              value={money(overview.profit.net)}
              hint={`Margin ${percent(overview.profit.margin)}`}
            />
            <StatCard
              index={3}
              icon={Banknote}
              accent="bg-cyan-50 text-cyan-700"
              label="Owed to owners"
              value={money(overview.ownerObligations.dueThisMonth)}
              hint={
                overview.ownerObligations.overdue > 0
                  ? `${money(overview.ownerObligations.overdue)} overdue`
                  : `${overview.ownerObligations.pendingCount} scheduled`
              }
            />
          </div>

          <SectionCard
            title="Revenue vs expenses"
            description={`Monthly, ${overview.window.from} to ${overview.window.to}, in ${overview.baseCurrency}.`}
          >
            {overview.monthly.every((point) => point.revenue === 0 && point.expenses === 0) ? (
              <EmptyState
                icon={TrendingUp}
                title="No financial activity yet"
                description="Record an expense or approve a reservation and the comparison appears here."
              />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overview.monthly}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={54}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value: number) =>
                        new Intl.NumberFormat('en-US', {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value) => money(Number(value ?? 0))}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
            <SectionCard
              title="Where the money goes"
              description="Expense totals by category for the window."
            >
              {overview.byCategory.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No expenses recorded"
                  description="Add your first cost to see the breakdown."
                />
              ) : (
                <>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overview.byCategory}
                          dataKey="baseAmount"
                          nameKey="label"
                          innerRadius={46}
                          outerRadius={70}
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {overview.byCategory.map((slice, index) => (
                            <Cell
                              key={slice.category}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => money(Number(value ?? 0))}
                          contentStyle={{
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {overview.byCategory.slice(0, 6).map((slice, index) => (
                      <li key={slice.category} className="flex items-center gap-2 text-sm">
                        <span
                          aria-hidden
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                        />
                        <span className="flex-1 truncate capitalize">{slice.label}</span>
                        <span className="font-medium tabular-nums">{money(slice.baseAmount)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </SectionCard>

            <SectionCard
              title="Profit per billboard"
              description="Revenue less the costs booked against each placement."
              action={
                <Link
                  href={ADMIN_ROUTES.FINANCE_REPORTS}
                  className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  Full report
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              }
              bodyClassName="px-0 pb-0"
            >
              {overview.billboards.length === 0 ? (
                <div className="px-5 pb-5">
                  <EmptyState
                    icon={TrendingUp}
                    title="Nothing to compare yet"
                    description="Link an expense to a billboard, or approve a reservation, to see profitability."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Billboard</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Costs</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.billboards.slice(0, 6).map((row) => (
                        <TableRow key={row.billboardId}>
                          <TableCell>
                            <p className="font-medium">{row.name}</p>
                            <p className="text-muted-foreground text-xs">{row.city}</p>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(row.revenue)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {money(row.expenses)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={row.netProfit >= 0 ? 'success' : 'destructive'}>
                              {money(row.netProfit)}
                            </Badge>
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
