'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateBillboardSchema,
  type UpdateBillboardSchemaInput,
} from '@/shared/contracts/billboard/billboard.schema';
import { BILLBOARD_STATUSES } from '@/shared/constants/billboard';
import type { Billboard } from '@/shared/types/billboard';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { BillboardImageInput } from '@/client/features/billboards/components/billboard-image-input';

type EditBillboardFormProps = {
  billboard: Billboard;
  onSaved?: () => void;
  onCancel?: () => void;
};

const inputClassName = 'w-full rounded-md border border-zinc-300 px-3 py-2';

export function EditBillboardForm({ billboard, onSaved, onCancel }: EditBillboardFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(billboard.images);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateBillboardSchemaInput>({
    resolver: zodResolver(updateBillboardSchema),
    defaultValues: {
      description: billboard.description ?? '',
      monthlyPrice: billboard.monthlyPrice,
      trafficCount: billboard.trafficCount ?? '',
      location: {
        address: billboard.location.address,
        city: billboard.location.city,
        country: billboard.location.country,
      },
      images: billboard.images,
      status: billboard.status,
    },
  });

  const handleImagesChange = (next: string[]) => {
    setImages(next);
    setValue('images', next, { shouldValidate: true });
  };

  const onSubmit = (values: UpdateBillboardSchemaInput) => {
    setSubmitError(null);

    startTransition(async () => {
      const result = await billboardClientService.update(billboard.id, values);
      if (!result.ok) {
        setSubmitError(result.error ?? 'Billboard update failed.');
        return;
      }

      onSaved?.();
    });
  };

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {submitError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="edit-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="edit-description"
          rows={3}
          className={inputClassName}
          {...register('description')}
        />
        {errors.description ? (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="edit-price" className="text-sm font-medium">
            Monthly Price
          </label>
          <input
            id="edit-price"
            type="number"
            step="any"
            className={inputClassName}
            {...register('monthlyPrice')}
          />
          {errors.monthlyPrice ? (
            <p className="text-sm text-red-600">{errors.monthlyPrice.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="edit-status" className="text-sm font-medium">
            Availability Status
          </label>
          <select id="edit-status" className={inputClassName} {...register('status')}>
            <option value={BILLBOARD_STATUSES.AVAILABLE}>Available</option>
            <option value={BILLBOARD_STATUSES.RESERVED}>Reserved</option>
            <option value={BILLBOARD_STATUSES.OCCUPIED}>Occupied</option>
            <option value={BILLBOARD_STATUSES.MAINTENANCE}>Maintenance</option>
          </select>
          {errors.status ? <p className="text-sm text-red-600">{errors.status.message}</p> : null}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="edit-traffic-count" className="text-sm font-medium">
          Monthly Traffic
        </label>
        <input
          id="edit-traffic-count"
          type="number"
          min="1"
          step="1"
          className={inputClassName}
          {...register('trafficCount', {
            setValueAs: (value) =>
              value === '' || value === undefined || value === null ? undefined : Number(value),
          })}
        />
        {errors.trafficCount ? (
          <p className="text-sm text-red-600">{errors.trafficCount.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="edit-address" className="text-sm font-medium">
          Address
        </label>
        <input id="edit-address" className={inputClassName} {...register('location.address')} />
        {errors.location?.address ? (
          <p className="text-sm text-red-600">{errors.location.address.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="edit-city" className="text-sm font-medium">
            City
          </label>
          <input id="edit-city" className={inputClassName} {...register('location.city')} />
          {errors.location?.city ? (
            <p className="text-sm text-red-600">{errors.location.city.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="edit-country" className="text-sm font-medium">
            Country
          </label>
          <input id="edit-country" className={inputClassName} {...register('location.country')} />
          {errors.location?.country ? (
            <p className="text-sm text-red-600">{errors.location.country.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Images</span>
        <BillboardImageInput value={images} onChange={handleImagesChange} disabled={isPending} />
        {errors.images ? <p className="text-sm text-red-600">{errors.images.message}</p> : null}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {isPending ? 'Saving changes...' : 'Save changes'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-md border border-zinc-300 px-4 py-2 disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
