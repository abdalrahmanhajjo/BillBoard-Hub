'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BILLBOARD_TYPES } from '@/shared/constants/billboard';
import type { Billboard, DigitalSpec } from '@/shared/types/billboard';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { BillboardStatusBadge } from '@/client/features/billboards/components/billboard-status-badge';
import { EditBillboardForm } from '@/client/features/billboards/components/edit-billboard-form';

type BillboardDetailsPageProps = {
  billboardId: string;
};

type BillboardDetails = {
  billboard: Billboard;
  spec: DigitalSpec | null;
};

async function fetchBillboardDetails(billboardId: string): Promise<BillboardDetails> {
  const result = await billboardClientService.get(billboardId);
  if (!result.ok) {
    throw new Error(result.error ?? 'We could not load this billboard. Try again.');
  }

  const billboard = result.data?.billboard as Billboard | undefined;
  if (!billboard) {
    throw new Error('We could not find this billboard. It may have been removed.');
  }

  let spec: DigitalSpec | null = null;
  if (billboard.type === BILLBOARD_TYPES.DIGITAL) {
    const specResult = await billboardClientService.getDigitalSpec(billboardId);
    spec = specResult.ok
      ? ((specResult.data?.spec as DigitalSpec | null | undefined) ?? null)
      : null;
  }

  return { billboard, spec };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-zinc-100 py-2 sm:flex-row sm:justify-between">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="text-sm font-medium text-zinc-900">{value}</dd>
    </div>
  );
}

export function BillboardDetailsPage({ billboardId }: BillboardDetailsPageProps) {
  const [details, setDetails] = useState<BillboardDetails | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const reloadDetails = useCallback(async () => {
    try {
      setDetails(await fetchBillboardDetails(billboardId));
      setError(null);
      setStatus('ready');
    } catch (loadFailure) {
      setError(
        loadFailure instanceof Error
          ? loadFailure.message
          : 'We could not load this billboard. Try again.',
      );
      setStatus('error');
    }
  }, [billboardId]);

  useEffect(() => {
    let active = true;

    fetchBillboardDetails(billboardId)
      .then((next) => {
        if (!active) return;
        setDetails(next);
        setStatus('ready');
      })
      .catch((loadFailure) => {
        if (!active) return;
        setError(
          loadFailure instanceof Error
            ? loadFailure.message
            : 'We could not refresh this billboard. Try again.',
        );
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [billboardId]);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <Link
        href="/user/admin/billboards"
        className="text-sm text-zinc-500 underline-offset-2 hover:underline"
      >
        ← Back to inventory
      </Link>

      {status === 'loading' ? <p className="text-sm text-zinc-600">Loading billboard…</p> : null}

      {status === 'error' ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {status === 'ready' && details ? (
        <>
          <header className="flex flex-col gap-2 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">{details.billboard.name}</h1>
              <p className="text-sm text-zinc-600">Code: {details.billboard.code}</p>
            </div>
            <div className="flex items-center gap-3">
              <BillboardStatusBadge status={details.billboard.status} />
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
                >
                  Edit
                </button>
              ) : null}
            </div>
          </header>

          {isEditing ? (
            <EditBillboardForm
              billboard={details.billboard}
              onSaved={() => {
                setIsEditing(false);
                void reloadDetails();
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <dl className="space-y-0">
                <DetailRow label="Type" value={details.billboard.type} />
                <DetailRow
                  label="Location"
                  value={`${details.billboard.location.address}, ${details.billboard.location.city}, ${details.billboard.location.country}`}
                />
                <DetailRow
                  label="Dimensions"
                  value={`${details.billboard.dimensions.width} × ${details.billboard.dimensions.height} ${details.billboard.dimensions.unit}`}
                />
                <DetailRow label="Monthly price" value={String(details.billboard.monthlyPrice)} />
                <DetailRow label="Status" value={details.billboard.status} />
                {details.billboard.description ? (
                  <DetailRow label="Description" value={details.billboard.description} />
                ) : null}
              </dl>

              {details.billboard.images.length > 0 ? (
                <div className="space-y-2">
                  <h2 className="text-lg font-medium">Images</h2>
                  <ul className="flex flex-wrap gap-3">
                    {details.billboard.images.map((url) => (
                      <li key={url}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={details.billboard.name}
                          className="h-28 w-28 rounded-md border border-zinc-200 object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {details.billboard.type === BILLBOARD_TYPES.DIGITAL ? (
                <div className="space-y-2">
                  <h2 className="text-lg font-medium">Digital specifications</h2>
                  {details.spec ? (
                    <dl className="space-y-0">
                      <DetailRow
                        label="Resolution"
                        value={`${details.spec.resolution.width} × ${details.spec.resolution.height} px`}
                      />
                      <DetailRow label="Brightness" value={`${details.spec.brightness} nits`} />
                      <DetailRow
                        label="Slot duration"
                        value={`${details.spec.slotDurationSeconds} s`}
                      />
                      <DetailRow
                        label="Rotating ads"
                        value={String(details.spec.rotatingAdsCount)}
                      />
                      <DetailRow label="Screen status" value={details.spec.screenStatus} />
                    </dl>
                  ) : (
                    <p className="text-sm text-zinc-600">
                      No specifications recorded yet for this digital billboard.
                    </p>
                  )}
                </div>
              ) : null}
            </>
          )}
        </>
      ) : null}
    </section>
  );
}
