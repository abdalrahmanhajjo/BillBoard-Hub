'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Columns3,
  Download,
  Gauge,
  Menu,
  Monitor,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import type { Billboard, BillboardStatus, BillboardType } from '@/shared/types/billboard';
import { BILLBOARD_STATUSES, BILLBOARD_TYPES } from '@/shared/constants/billboard';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { CreateBillboardForm } from '@/client/features/billboards/components/create-billboard-form';
import { EditBillboardForm } from '@/client/features/billboards/components/edit-billboard-form';
import { BillboardInventoryTable } from '@/client/features/billboards/components/billboard-inventory-table';
import { DigitalSpecsManager } from '@/client/features/billboards/components/digital-specs-manager';

type LoadStatus = 'loading' | 'ready' | 'error';
type DrawerMode = 'create' | 'edit' | 'digital' | null;

async function fetchBillboards(): Promise<Billboard[]> {
  const result = await billboardClientService.list();
  if (!result.ok) {
    throw new Error(result.error ?? 'We could not load billboard inventory. Try again.');
  }
  return (result.data?.billboards as Billboard[] | undefined) ?? [];
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-32 appearance-none rounded-md border border-slate-200 bg-white pr-9 pl-3 text-xs font-medium text-slate-700 shadow-sm transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-3 right-3 size-3 text-slate-400" />
    </label>
  );
}

function MetricCard({
  icon,
  value,
  label,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  detail: string;
  tone: string;
}) {
  return (
    <article className="flex min-h-24 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
        {icon}
      </div>
      <div>
        <strong className="block text-xl leading-none font-semibold tracking-tight text-slate-900 tabular-nums">
          {value}
        </strong>
        <span className="mt-1 block text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-[10px] text-slate-400">{detail}</span>
      </div>
    </article>
  );
}

export function AdminBillboardsPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BillboardStatus>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | BillboardType>('');
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);

  const loadBillboards = useCallback(async () => {
    try {
      setBillboards(await fetchBillboards());
      setLoadError(null);
      setStatus('ready');
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'We could not load billboard inventory. Try again.',
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchBillboards()
      .then((next) => {
        if (!active) return;
        setBillboards(next);
        setLoadError(null);
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : 'We could not refresh billboard inventory. Try again.',
        );
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const cityOptions = useMemo(
    () =>
      [...new Set(billboards.map((item) => item.location.city.trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map((city) => ({ value: city, label: city })),
    [billboards],
  );

  const filteredBillboards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const normalizedCity = cityFilter.trim().toLowerCase();
    return billboards.filter((billboard) => {
      const matchesStatus = statusFilter === 'all' || billboard.status === statusFilter;
      const matchesType = !typeFilter || billboard.type === typeFilter;
      const matchesCity =
        !normalizedCity || billboard.location.city.trim().toLowerCase() === normalizedCity;
      const matchesQuery =
        !normalized ||
        [
          billboard.name,
          billboard.code,
          billboard.type,
          billboard.location.address,
          billboard.location.city,
          billboard.location.country,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalized);
      return matchesStatus && matchesType && matchesCity && matchesQuery;
    });
  }, [billboards, query, statusFilter, typeFilter, cityFilter]);

  const hasActiveFilters =
    query.trim() !== '' || statusFilter !== 'all' || typeFilter !== '' || cityFilter !== '';

  const clearFilters = useCallback(() => {
    setQuery('');
    setStatusFilter('all');
    setTypeFilter('');
    setCityFilter('');
  }, []);

  const counts = useMemo(() => {
    const next = {
      all: billboards.length,
      available: 0,
      reserved: 0,
      occupied: 0,
      maintenance: 0,
      digital: 0,
    };

    for (const billboard of billboards) {
      if (billboard.status === BILLBOARD_STATUSES.AVAILABLE) next.available += 1;
      if (billboard.status === BILLBOARD_STATUSES.RESERVED) next.reserved += 1;
      if (billboard.status === BILLBOARD_STATUSES.OCCUPIED) next.occupied += 1;
      if (billboard.status === BILLBOARD_STATUSES.MAINTENANCE) next.maintenance += 1;
      if (billboard.type === BILLBOARD_TYPES.DIGITAL) next.digital += 1;
    }

    return next;
  }, [billboards]);

  const handleStatusChange = useCallback(
    async (billboardId: string, nextStatus: BillboardStatus) => {
      setActionError(null);
      setPendingStatusId(billboardId);
      const result = await billboardClientService.updateAvailability(billboardId, {
        status: nextStatus,
      });
      setPendingStatusId(null);
      if (!result.ok) {
        setActionError(
          result.error ?? 'We could not update availability. Refresh the inventory and try again.',
        );
        return;
      }
      await loadBillboards();
    },
    [loadBillboards],
  );

  const openEdit = (billboard: Billboard) => {
    setSelectedBillboard(billboard);
    setDrawerMode('edit');
  };

  const handleDelete = async (billboard: Billboard) => {
    if (!window.confirm(`Archive ${billboard.name}? This removes it from active inventory.`))
      return;
    setActionError(null);
    const result = await billboardClientService.delete(billboard.id);
    if (!result.ok) {
      setActionError(
        result.error ?? 'We could not archive this billboard. Refresh the inventory and try again.',
      );
      return;
    }
    await loadBillboards();
  };

  const statusTabs: Array<{ key: 'all' | BillboardStatus; label: string; count: number }> = [
    { key: 'all', label: 'All', count: counts.all },
    { key: BILLBOARD_STATUSES.AVAILABLE, label: 'Available', count: counts.available },
    { key: BILLBOARD_STATUSES.RESERVED, label: 'Reserved', count: counts.reserved },
    { key: BILLBOARD_STATUSES.OCCUPIED, label: 'Occupied', count: counts.occupied },
    { key: BILLBOARD_STATUSES.MAINTENANCE, label: 'Maintenance', count: counts.maintenance },
  ];

  return (
    <div className="min-h-screen bg-[#fbfcfe] text-slate-800">
      <main className="mx-auto w-full max-w-[1480px] p-4 md:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">
              Billboard Management
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage and maintain all billboard inventory across Lebanon.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-medium shadow-sm hover:bg-slate-50"
            >
              <Download className="size-3.5" /> Export
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedBillboard(null);
                setDrawerMode('create');
              }}
              className="flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[.98]"
            >
              <Plus className="size-4" /> Add Billboard
            </button>
          </div>
        </div>

        <section className="mt-6 flex flex-wrap items-center gap-2">
          <FilterSelect
            label="All Cities"
            value={cityFilter}
            onChange={setCityFilter}
            options={cityOptions}
          />
          <FilterSelect
            label="All Formats"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as '' | BillboardType)}
            options={[
              { value: BILLBOARD_TYPES.STATIC, label: 'Static' },
              { value: BILLBOARD_TYPES.DIGITAL, label: 'Digital' },
            ]}
          />
          <FilterSelect
            label="All Availability"
            value={statusFilter === 'all' ? '' : statusFilter}
            onChange={(value) => setStatusFilter((value as BillboardStatus) || 'all')}
            options={[
              { value: BILLBOARD_STATUSES.AVAILABLE, label: 'Available' },
              { value: BILLBOARD_STATUSES.RESERVED, label: 'Reserved' },
              { value: BILLBOARD_STATUSES.OCCUPIED, label: 'Occupied' },
              { value: BILLBOARD_STATUSES.MAINTENANCE, label: 'Maintenance' },
            ]}
          />
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <X className="size-3.5" /> Clear filters
            </button>
          ) : null}
          <button
            type="button"
            className="ml-auto hidden h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium sm:flex"
          >
            Saved Views <ChevronDown className="size-3 text-slate-400" />
          </button>
        </section>

        <section className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-white p-1.5 sm:grid-cols-[minmax(220px,1fr)_2.2fr]">
          <label className="relative">
            <Search className="absolute top-2.5 left-2.5 size-3.5 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by ID, location, or other..."
              className="h-9 w-full rounded-md border border-slate-200 pl-8 text-[11px] outline-none focus:border-blue-400"
            />
          </label>
          <div className="flex min-w-0 items-center overflow-x-auto rounded-md bg-slate-50 p-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex h-8 min-w-max flex-1 items-center justify-center gap-2 rounded px-2 text-[10px] font-medium transition ${
                  statusFilter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] text-slate-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[10px] font-medium"
            >
              0 selected
            </button>
            <button
              type="button"
              className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[10px] font-medium"
            >
              Bulk Actions <ChevronDown className="ml-1 inline size-3" />
            </button>
            <button
              type="button"
              className="ml-auto hidden h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[10px] font-medium sm:flex"
            >
              <Columns3 className="size-3" /> Columns
            </button>
            <button
              type="button"
              className="hidden h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[10px] font-medium sm:flex"
            >
              <Menu className="size-3" /> Density
            </button>
            <button
              type="button"
              onClick={() => void loadBillboards()}
              className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white"
              aria-label="Refresh inventory"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
          {actionError ? (
            <p
              role="alert"
              className="mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {actionError}
            </p>
          ) : null}
          <BillboardInventoryTable
            billboards={filteredBillboards}
            isLoading={status === 'loading'}
            error={status === 'error' ? loadError : null}
            emptyMessage={
              hasActiveFilters
                ? 'No billboards match your search or filters.'
                : 'Add a billboard to begin.'
            }
            onStatusChange={handleStatusChange}
            onEdit={openEdit}
            onDelete={(billboard) => void handleDelete(billboard)}
            pendingStatusId={pendingStatusId}
          />
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            icon={<Monitor className="size-4" />}
            value={`${counts.all || 0}+`}
            label="Total Billboards"
            detail="Across Lebanon"
            tone="bg-blue-50 text-blue-600"
          />
          <MetricCard
            icon={<Sparkles className="size-4" />}
            value={String(counts.available)}
            label="Available"
            detail="Ready for booking"
            tone="bg-emerald-50 text-emerald-600"
          />
          <MetricCard
            icon={<CalendarDays className="size-4" />}
            value={String(counts.reserved + counts.occupied)}
            label="Booked"
            detail="Current campaigns"
            tone="bg-indigo-50 text-indigo-600"
          />
          <MetricCard
            icon={<Settings className="size-4" />}
            value={String(counts.maintenance)}
            label="Maintenance"
            detail="Needs attention"
            tone="bg-orange-50 text-orange-600"
          />
          <button type="button" onClick={() => setDrawerMode('digital')} className="text-left">
            <MetricCard
              icon={<Gauge className="size-4" />}
              value={String(counts.digital)}
              label="Digital screens"
              detail="Manage specifications"
              tone="bg-cyan-50 text-cyan-600"
            />
          </button>
        </section>

        <section className="mt-3 grid gap-3 xl:grid-cols-[.8fr_1.4fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold">Inventory Overview</h2>
              <button
                type="button"
                className="rounded border border-slate-200 px-2 py-1 text-[9px]"
              >
                View Full Report
              </button>
            </div>
            <div className="mt-5 grid grid-cols-[1fr_120px] items-center gap-4">
              <ul className="space-y-3 text-[10px]">
                {[
                  ['Total Billboards', counts.all, 'bg-blue-500'],
                  ['Available', counts.available, 'bg-emerald-500'],
                  ['Booked', counts.reserved + counts.occupied, 'bg-indigo-500'],
                  ['Maintenance', counts.maintenance, 'bg-orange-500'],
                ].map(([label, value, color]) => (
                  <li key={String(label)} className="flex items-center gap-2">
                    <span className={`size-2 rounded-sm ${color}`} />
                    <span className="flex-1">{label}</span>
                    <strong className="tabular-nums">{value}</strong>
                  </li>
                ))}
              </ul>
              <div className="relative mx-auto size-28 rounded-full bg-[conic-gradient(#10b981_0_49%,#2563eb_49%_83%,#f97316_83%_93%,#e2e8f0_93%)] p-3">
                <div className="flex size-full flex-col items-center justify-center rounded-full bg-white">
                  <strong className="text-base tabular-nums">{counts.all}</strong>
                  <span className="text-[9px] text-slate-500">Total</span>
                </div>
              </div>
            </div>
          </article>
          <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-4 pt-4">
              <h2 className="text-xs font-semibold">Inventory Map</h2>
              <span className="text-[9px] text-slate-400">Lebanon coverage</span>
            </div>
            <div className="relative mt-3 h-56 overflow-hidden bg-[radial-gradient(circle_at_20%_70%,#bae6fd_0_20%,transparent_21%),linear-gradient(120deg,#e0f2fe,#f8fafc_42%,#e2e8f0)]">
              <div className="absolute inset-0 [background-image:linear-gradient(30deg,transparent_48%,#cbd5e1_49%,transparent_50%),linear-gradient(150deg,transparent_48%,#cbd5e1_49%,transparent_50%)] [background-size:38px_38px] opacity-50" />
              <span className="absolute top-1/2 left-1/2 -translate-1/2 text-2xl tracking-[.18em] text-slate-500">
                LEBANON
              </span>
              {[
                ['30', 'top-8 left-1/3', 'bg-emerald-500'],
                ['16', 'top-12 right-1/3', 'bg-blue-500'],
                ['22', 'top-1/2 right-1/4', 'bg-emerald-500'],
                ['18', 'bottom-12 left-1/4', 'bg-blue-500'],
                ['7', 'bottom-7 right-1/3', 'bg-orange-500'],
              ].map(([label, pos, color]) => (
                <span
                  key={label}
                  className={`absolute ${pos} ${color} flex size-7 items-center justify-center rounded-full border-4 border-white/70 text-[9px] font-bold text-white shadow-sm`}
                >
                  {label}
                </span>
              ))}
            </div>
          </article>
        </section>
      </main>

      {drawerMode ? (
        <>
          <button
            type="button"
            onClick={() => setDrawerMode(null)}
            className="fixed inset-0 z-30 bg-slate-950/10 backdrop-blur-[1px]"
            aria-label="Close editor"
          />
          <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[390px] flex-col border-l border-slate-200 bg-white shadow-[-20px_0_50px_rgba(15,23,42,.08)]">
            <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {drawerMode === 'create'
                    ? 'Add New Billboard'
                    : drawerMode === 'edit'
                      ? 'Edit Billboard'
                      : 'Digital Specifications'}
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  {drawerMode === 'create'
                    ? 'Create a new billboard inventory record'
                    : drawerMode === 'edit'
                      ? `Update ${selectedBillboard?.code}`
                      : 'Configure digital screen capabilities'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerMode(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="flex border-b border-slate-200 px-5 text-[10px] font-medium">
              {['Basic Info', 'Location', 'Pricing', 'Media'].map((tab, index) => (
                <span
                  key={tab}
                  className={`border-b-2 px-3 py-3 ${index === 0 ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="billboard-drawer-form flex-1 overflow-y-auto px-5 py-5 text-xs">
              {drawerMode === 'create' ? (
                <CreateBillboardForm
                  onCreated={() => {
                    setDrawerMode(null);
                    void loadBillboards();
                  }}
                />
              ) : null}
              {drawerMode === 'edit' && selectedBillboard ? (
                <EditBillboardForm
                  billboard={selectedBillboard}
                  onSaved={() => {
                    setDrawerMode(null);
                    void loadBillboards();
                  }}
                  onCancel={() => setDrawerMode(null)}
                />
              ) : null}
              {drawerMode === 'digital' ? <DigitalSpecsManager billboards={billboards} /> : null}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
