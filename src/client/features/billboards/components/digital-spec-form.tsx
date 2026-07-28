'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  upsertDigitalSpecSchema,
  type UpsertDigitalSpecSchemaInput,
} from '@/shared/contracts/billboard/digital-spec.schema';
import { SCREEN_STATUSES } from '@/shared/constants/billboard';
import type { DigitalSpec } from '@/shared/types/billboard';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { FormStatusMessages } from '@/client/features/billboards/components/form-status-messages';

type DigitalSpecFormProps = {
  billboardId: string;
  initialSpec: DigitalSpec | null;
  onSaved?: () => void;
};

const inputClassName = 'w-full rounded-md border border-zinc-300 px-3 py-2';

export function DigitalSpecForm({ billboardId, initialSpec, onSaved }: DigitalSpecFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpsertDigitalSpecSchemaInput>({
    resolver: zodResolver(upsertDigitalSpecSchema),
    defaultValues: {
      resolution: {
        width: initialSpec?.resolution.width ?? '',
        height: initialSpec?.resolution.height ?? '',
      },
      brightness: initialSpec?.brightness ?? '',
      slotDurationSeconds: initialSpec?.slotDurationSeconds ?? '',
      rotatingAdsCount: initialSpec?.rotatingAdsCount ?? '',
      screenStatus: initialSpec?.screenStatus ?? SCREEN_STATUSES.OFF,
    },
  });

  const onSubmit = (values: UpsertDigitalSpecSchemaInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    startTransition(async () => {
      const result = await billboardClientService.saveDigitalSpec(billboardId, values);
      if (!result.ok) {
        setSubmitError(
          result.error ??
            'We could not save the digital specifications. Review the values and try again.',
        );
        return;
      }

      setSubmitSuccess('Digital specifications saved. The screen details are now up to date.');
      onSaved?.();
    });
  };

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormStatusMessages error={submitError} success={submitSuccess} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="resolutionWidth" className="text-sm font-medium">
            Resolution Width (px)
          </label>
          <input
            id="resolutionWidth"
            type="number"
            step="1"
            className={inputClassName}
            {...register('resolution.width')}
          />
          {errors.resolution?.width ? (
            <p className="text-sm text-red-600">{errors.resolution.width.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="resolutionHeight" className="text-sm font-medium">
            Resolution Height (px)
          </label>
          <input
            id="resolutionHeight"
            type="number"
            step="1"
            className={inputClassName}
            {...register('resolution.height')}
          />
          {errors.resolution?.height ? (
            <p className="text-sm text-red-600">{errors.resolution.height.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="brightness" className="text-sm font-medium">
            Brightness (nits)
          </label>
          <input
            id="brightness"
            type="number"
            step="any"
            className={inputClassName}
            {...register('brightness')}
          />
          {errors.brightness ? (
            <p className="text-sm text-red-600">{errors.brightness.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="slotDurationSeconds" className="text-sm font-medium">
            Slot Duration (seconds)
          </label>
          <input
            id="slotDurationSeconds"
            type="number"
            step="any"
            className={inputClassName}
            {...register('slotDurationSeconds')}
          />
          {errors.slotDurationSeconds ? (
            <p className="text-sm text-red-600">{errors.slotDurationSeconds.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="rotatingAdsCount" className="text-sm font-medium">
            Number of Rotating Ads
          </label>
          <input
            id="rotatingAdsCount"
            type="number"
            step="1"
            className={inputClassName}
            {...register('rotatingAdsCount')}
          />
          {errors.rotatingAdsCount ? (
            <p className="text-sm text-red-600">{errors.rotatingAdsCount.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="screenStatus" className="text-sm font-medium">
            Screen Status
          </label>
          <select id="screenStatus" className={inputClassName} {...register('screenStatus')}>
            <option value={SCREEN_STATUSES.ON}>On</option>
            <option value={SCREEN_STATUSES.OFF}>Off</option>
            <option value={SCREEN_STATUSES.STANDBY}>Standby</option>
            <option value={SCREEN_STATUSES.FAULT}>Fault</option>
          </select>
          {errors.screenStatus ? (
            <p className="text-sm text-red-600">{errors.screenStatus.message}</p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? 'Saving specification...' : 'Save specification'}
      </button>
    </form>
  );
}
