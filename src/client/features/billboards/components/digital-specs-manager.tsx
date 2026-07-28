'use client';

import { useState } from 'react';
import type { Billboard, DigitalSpec } from '@/shared/types/billboard';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { DigitalSpecForm } from '@/client/features/billboards/components/digital-spec-form';

type DigitalSpecsManagerProps = {
  billboards: Billboard[];
};

type SpecStatus = 'idle' | 'loading' | 'ready' | 'error';

const inputClassName = 'w-full rounded-md border border-zinc-300 px-3 py-2';

export function DigitalSpecsManager({ billboards }: DigitalSpecsManagerProps) {
  const digitalBillboards = billboards.filter(
    (billboard) => billboard.type === BILLBOARD_TYPES.DIGITAL,
  );

  const [selectedId, setSelectedId] = useState('');
  const [spec, setSpec] = useState<DigitalSpec | null>(null);
  const [specStatus, setSpecStatus] = useState<SpecStatus>('idle');
  const [specError, setSpecError] = useState<string | null>(null);

  const loadSpec = async (billboardId: string) => {
    setSpecStatus('loading');
    setSpecError(null);

    const result = await billboardClientService.getDigitalSpec(billboardId);
    if (!result.ok) {
      setSpecError(
        result.error ?? 'We could not load this screen specification. Choose the screen again.',
      );
      setSpecStatus('error');
      return;
    }

    setSpec((result.data?.spec as DigitalSpec | null | undefined) ?? null);
    setSpecStatus('ready');
  };

  const handleSelect = (billboardId: string) => {
    setSelectedId(billboardId);

    if (!billboardId) {
      setSpec(null);
      setSpecStatus('idle');
      setSpecError(null);
      return;
    }

    void loadSpec(billboardId);
  };

  if (digitalBillboards.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        No digital billboards yet. Create a digital billboard to manage its specifications.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="digitalBillboard" className="text-sm font-medium">
          Digital billboard
        </label>
        <select
          id="digitalBillboard"
          value={selectedId}
          onChange={(event) => handleSelect(event.target.value)}
          className={inputClassName}
        >
          <option value="">Select a digital billboard…</option>
          {digitalBillboards.map((billboard) => (
            <option key={billboard.id} value={billboard.id}>
              {billboard.name} ({billboard.code})
            </option>
          ))}
        </select>
      </div>

      {specStatus === 'loading' ? (
        <p className="text-sm text-zinc-600">Loading specification…</p>
      ) : null}

      {specStatus === 'error' ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {specError}
        </p>
      ) : null}

      {specStatus === 'ready' && selectedId ? (
        <DigitalSpecForm
          key={selectedId}
          billboardId={selectedId}
          initialSpec={spec}
          onSaved={() => {
            void loadSpec(selectedId);
          }}
        />
      ) : null}
    </div>
  );
}
