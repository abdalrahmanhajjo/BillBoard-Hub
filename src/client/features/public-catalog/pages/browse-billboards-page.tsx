'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Monitor,
  DollarSign,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { PublicBillboard } from '@/shared/types/billboard';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import { BillboardGrid } from '@/client/features/public-catalog/components/billboard-grid';
import { Button } from '@/client/ui/components/ui/button';
import { Checkbox } from '@/client/ui/components/ui/checkbox';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/client/ui/components/ui/drawer';
import { Input } from '@/client/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/ui/components/ui/select';

const PAGE_SIZE = 9;

type BrowseBillboardsPageProps = {
  billboards: PublicBillboard[];
  error?: string | null;
  query?: string;
};

type SortOption = 'featured' | 'price-low' | 'price-high' | 'traffic';

function searchableText(billboard: PublicBillboard): string {
  return [
    billboard.name,
    billboard.location.address,
    billboard.location.city,
    billboard.location.country,
  ]
    .join(' ')
    .toLowerCase();
}

export function BrowseBillboardsPage({ billboards, error, query }: BrowseBillboardsPageProps) {
  const cities = useMemo(
    () =>
      [...new Set(billboards.map((billboard) => billboard.location.city))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [billboards],
  );
  const databaseMaxPrice = useMemo(
    () => Math.max(0, ...billboards.map((billboard) => billboard.monthlyPrice)),
    [billboards],
  );

  const [draftQuery, setDraftQuery] = useState(query ?? '');
  const [searchQuery, setSearchQuery] = useState(query ?? '');
  const [city, setCity] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(databaseMaxPrice);
  const [sort, setSort] = useState<SortOption>('featured');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredBillboards = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    const result = billboards.filter((billboard) => {
      if (needle && !searchableText(billboard).includes(needle)) return false;
      if (city && billboard.location.city !== city) return false;
      if (types.length > 0 && !types.includes(billboard.type)) return false;
      if (availableOnly && !billboard.isAvailable) return false;
      if (databaseMaxPrice > 0 && billboard.monthlyPrice > maxPrice) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === 'price-low') return a.monthlyPrice - b.monthlyPrice;
      if (sort === 'price-high') return b.monthlyPrice - a.monthlyPrice;
      if (sort === 'traffic') return (b.trafficCount ?? 0) - (a.trafficCount ?? 0);
      return Number(b.isAvailable) - Number(a.isAvailable);
    });
  }, [availableOnly, billboards, city, databaseMaxPrice, maxPrice, searchQuery, sort, types]);

  const pageCount = Math.max(1, Math.ceil(filteredBillboards.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const visibleBillboards = filteredBillboards.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );
  const activeFilterCount =
    Number(Boolean(city)) +
    types.length +
    Number(availableOnly) +
    Number(databaseMaxPrice > 0 && maxPrice < databaseMaxPrice);

  const resetFilters = () => {
    setCity('');
    setTypes([]);
    setAvailableOnly(false);
    setMaxPrice(databaseMaxPrice);
    setPage(1);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(draftQuery);
    setPage(1);
  };

  const toggleType = (type: string) => {
    setTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
    setPage(1);
  };

  return (
    <section className="bg-zinc-50/60 text-zinc-950">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-7 pb-28 sm:px-8 sm:py-10 lg:px-16 lg:py-12 xl:px-24">
        <div className="mb-6 sm:hidden">
          <h1 className="text-[2rem] leading-[1.05] font-semibold tracking-[-0.04em] text-zinc-950">
            Lebanon Billboard Locations
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Discover premium billboard inventory across Lebanon.
          </p>
          <p className="mt-5 text-sm text-zinc-500">
            <strong className="text-lg font-semibold text-blue-600">
              {filteredBillboards.length}
            </strong>{' '}
            locations found
          </p>
        </div>

        <form
          onSubmit={submitSearch}
          className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_10px_35px_rgba(24,24,27,.05)]"
        >
          <Search className="ml-2 size-5 shrink-0 text-zinc-400 sm:ml-3" aria-hidden />
          <label htmlFor="catalog-search" className="sr-only">
            Search billboards
          </label>
          <Input
            id="catalog-search"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="Search by city, road, or billboard name"
            className="h-12 min-w-0 flex-1 bg-transparent px-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 sm:text-base"
          />
          <Button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:px-7"
          >
            <span className="hidden sm:inline">Search inventory</span>
            <Search className="size-5 sm:hidden" aria-hidden />
          </Button>
        </form>

        <div className="mt-3 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          <FilterSelect
            icon={MapPin}
            label={city || 'All Lebanon'}
            value={city}
            onChange={(value) => {
              setCity(value);
              setPage(1);
            }}
            options={cities.map((item) => ({ label: item, value: item }))}
          />
          <FilterSelect
            icon={Monitor}
            label={
              types.length === 1
                ? `${types[0][0].toUpperCase()}${types[0].slice(1)}`
                : 'All formats'
            }
            value={types.length === 1 ? types[0] : ''}
            onChange={(value) => {
              setTypes(value ? [value] : []);
              setPage(1);
            }}
            options={[
              { label: 'Digital', value: BILLBOARD_TYPES.DIGITAL },
              { label: 'Static', value: BILLBOARD_TYPES.STATIC },
            ]}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-300 lg:hidden"
          >
            <DollarSign className="size-4 text-blue-600" aria-hidden />
            Budget
            <ChevronDown className="size-4 text-zinc-400" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAvailableOnly((current) => !current);
              setPage(1);
            }}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
              availableOnly
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <Check className="size-4" aria-hidden />
            Availability
          </Button>
        </div>

        <div className="mt-4 flex h-12 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-500 sm:hidden">
          <SlidersHorizontal className="size-4 text-blue-600" aria-hidden />
          <span>Sort:</span>
          <Select
            value={sort}
            onValueChange={(value) => {
              if (value) {
                setSort(value as SortOption);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-10 min-w-0 flex-1 border-0 p-0 font-semibold shadow-none focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Recommended</SelectItem>
              <SelectItem value="price-low">Price: Low to high</SelectItem>
              <SelectItem value="price-high">Price: High to low</SelectItem>
              <SelectItem value="traffic">Highest traffic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <div className="mt-5 grid items-start gap-6 sm:mt-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-8">
            <CatalogFilters
              className="hidden lg:block"
              cities={cities}
              city={city}
              setCity={(value) => {
                setCity(value);
                setPage(1);
              }}
              types={types}
              toggleType={toggleType}
              availableOnly={availableOnly}
              setAvailableOnly={(value) => {
                setAvailableOnly(value);
                setPage(1);
              }}
              maxPrice={maxPrice}
              databaseMaxPrice={databaseMaxPrice}
              setMaxPrice={(value) => {
                setMaxPrice(value);
                setPage(1);
              }}
              resetFilters={resetFilters}
            />

            <div className="min-w-0">
              <div className="mb-5 hidden flex-col gap-3 border-b border-zinc-200 pb-5 sm:flex sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-zinc-950">
                    {filteredBillboards.length}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {filteredBillboards.length === 1 ? 'placement found' : 'placements found'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  Sort by
                  <Select
                    value={sort}
                    onValueChange={(value) => {
                      if (value) {
                        setSort(value as SortOption);
                        setPage(1);
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 px-4 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Availability</SelectItem>
                      <SelectItem value="price-low">Price: Low to high</SelectItem>
                      <SelectItem value="price-high">Price: High to low</SelectItem>
                      <SelectItem value="traffic">Highest traffic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <BillboardGrid
                billboards={visibleBillboards}
                emptyMessage={
                  searchQuery
                    ? `No billboards match “${searchQuery}”.`
                    : 'No billboards match these filters.'
                }
              />

              {filteredBillboards.length > PAGE_SIZE ? (
                <nav
                  aria-label="Catalog pagination"
                  className="mt-8 flex items-center justify-center gap-2"
                >
                  <PageButton
                    label="Previous page"
                    disabled={activePage === 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </PageButton>
                  {Array.from({ length: pageCount }, (_, index) => index + 1)
                    .filter(
                      (item) =>
                        item === 1 || item === pageCount || Math.abs(item - activePage) <= 1,
                    )
                    .map((item, index, pages) => (
                      <span key={item} className="contents">
                        {index > 0 && item - pages[index - 1] > 1 ? (
                          <span className="px-1 text-zinc-400">…</span>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPage(item)}
                          aria-current={item === activePage ? 'page' : undefined}
                          className={`size-10 rounded-xl text-sm font-semibold ${
                            item === activePage
                              ? 'bg-blue-600 text-white'
                              : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                          }`}
                        >
                          {item}
                        </Button>
                      </span>
                    ))}
                  <PageButton
                    label="Next page"
                    disabled={activePage === pageCount}
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </PageButton>
                </nav>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen} showSwipeHandle>
        <DrawerContent className="lg:hidden">
          <DrawerHeader className="flex-row items-center justify-between p-5 text-left">
            <div>
              <DrawerTitle className="text-xl font-semibold">Filters</DrawerTitle>
              <DrawerDescription>Refine the live billboard inventory.</DrawerDescription>
            </div>
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="rounded-full bg-zinc-100"
                  aria-label="Close filters"
                />
              }
            >
              <X className="size-5" aria-hidden />
            </DrawerClose>
          </DrawerHeader>
          <div className="overflow-y-auto px-5">
            <CatalogFilters
              cities={cities}
              city={city}
              setCity={setCity}
              types={types}
              toggleType={toggleType}
              availableOnly={availableOnly}
              setAvailableOnly={setAvailableOnly}
              maxPrice={maxPrice}
              databaseMaxPrice={databaseMaxPrice}
              setMaxPrice={setMaxPrice}
              resetFilters={resetFilters}
              embedded
            />
          </div>
          <DrawerFooter className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <Button
              type="button"
              onClick={() => {
                setPage(1);
                setMobileFiltersOpen(false);
              }}
              className="mt-4 h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white"
            >
              Show {filteredBillboards.length} placements
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {!mobileFiltersOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/96 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_35px_rgba(24,24,27,.09)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-blue-600">
              <SlidersHorizontal className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900">Refine your search</p>
              <p className="text-xs text-zinc-500">{filteredBillboards.length} results</p>
            </div>
            <Button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white"
            >
              Show filters
              {activeFilterCount > 0 ? (
                <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs text-blue-600">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

type FilterSelectProps = {
  icon: typeof MapPin;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
};

function FilterSelect({ icon: Icon, label, value, onChange, options }: FilterSelectProps) {
  return (
    <Select value={value || null} onValueChange={(nextValue) => onChange(nextValue ?? '')}>
      <SelectTrigger className="min-h-11 w-auto shrink-0 rounded-xl border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700">
        <Icon className="size-4 text-blue-600" aria-hidden />
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type CatalogFiltersProps = {
  className?: string;
  cities: string[];
  city: string;
  setCity: (value: string) => void;
  types: string[];
  toggleType: (value: string) => void;
  availableOnly: boolean;
  setAvailableOnly: (value: boolean) => void;
  maxPrice: number;
  databaseMaxPrice: number;
  setMaxPrice: (value: number) => void;
  resetFilters: () => void;
  embedded?: boolean;
};

function CatalogFilters({
  className = '',
  cities,
  city,
  setCity,
  types,
  toggleType,
  availableOnly,
  setAvailableOnly,
  maxPrice,
  databaseMaxPrice,
  setMaxPrice,
  resetFilters,
  embedded = false,
}: CatalogFiltersProps) {
  return (
    <aside
      className={`${className} ${
        embedded ? '' : 'sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5'
      }`}
    >
      {!embedded ? (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button
            type="button"
            variant="ghost"
            onClick={resetFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Clear all
          </Button>
        </div>
      ) : null}

      <div className="space-y-7">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-zinc-900">City</legend>
          <Select value={city || null} onValueChange={(value) => setCity(value ?? '')}>
            <SelectTrigger className="h-11 w-full rounded-xl border-zinc-200 px-3 text-zinc-700">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All cities</SelectItem>
              {cities.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-zinc-900">Format</legend>
          <div className="space-y-3">
            {[
              { label: 'Digital', value: BILLBOARD_TYPES.DIGITAL },
              { label: 'Static', value: BILLBOARD_TYPES.STATIC },
            ].map((option) => (
              <label
                key={option.value}
                className="flex min-h-8 items-center gap-3 text-sm text-zinc-700"
              >
                <Checkbox
                  checked={types.includes(option.value)}
                  onCheckedChange={() => toggleType(option.value)}
                  className="size-4 rounded border-zinc-300 accent-blue-600"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-zinc-900">Availability</legend>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-zinc-200">
            <Button
              type="button"
              onClick={() => setAvailableOnly(false)}
              className={`h-11 text-sm font-medium ${
                !availableOnly ? 'bg-blue-600 text-white' : 'bg-white text-zinc-600'
              }`}
            >
              All
            </Button>
            <Button
              type="button"
              onClick={() => setAvailableOnly(true)}
              className={`h-11 text-sm font-medium ${
                availableOnly ? 'bg-blue-600 text-white' : 'bg-white text-zinc-600'
              }`}
            >
              Available
            </Button>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-sm font-semibold text-zinc-900">Monthly budget</legend>
          <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
            <span>$0</span>
            <span>${maxPrice.toLocaleString()}</span>
          </div>
          <Input
            type="range"
            min={0}
            max={Math.max(databaseMaxPrice, 1)}
            step={50}
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
            className="w-full accent-blue-600"
          />
        </fieldset>
      </div>
    </aside>
  );
}

function PageButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </Button>
  );
}
