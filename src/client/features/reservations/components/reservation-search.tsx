'use client';

import { SearchIcon } from 'lucide-react';
import { Input } from '@/client/ui/components/ui/input';

interface ReservationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReservationSearch({ value, onChange }: ReservationSearchProps) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        placeholder="Search by reservation ID, billboard..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
