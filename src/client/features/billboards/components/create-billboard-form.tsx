'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createBillboardSchema,
  type CreateBillboardSchemaInput,
} from '@/shared/contracts/billboard/billboard.schema';
import { BILLBOARD_STATUSES, BILLBOARD_TYPES, DIMENSION_UNITS } from '@/shared/constants/billboard';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { BillboardImageInput } from '@/client/features/billboards/components/billboard-image-input';

type CreateBillboardFormProps = {
  onCreated?: () => void;
};

const inputClassName = 'w-full rounded-md border border-zinc-300 px-3 py-2';

export function CreateBillboardForm({ onCreated }: CreateBillboardFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateBillboardSchemaInput>({
    resolver: zodResolver(createBillboardSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      type: BILLBOARD_TYPES.STATIC,
      status: BILLBOARD_STATUSES.AVAILABLE,
      location: { address: '', city: '', country: '' },
      dimensions: { width: '', height: '', unit: DIMENSION_UNITS.METERS },
      monthlyPrice: '',
      trafficCount: '',
      images: [],
    },
  });

  const handleImagesChange = (next: string[]) => {
    setImages(next);
    setValue('images', next, { shouldValidate: true });
  };

  const onSubmit = (values: CreateBillboardSchemaInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    startTransition(async () => {
      const result = await billboardClientService.create(values);
      if (!result.ok) {
        setSubmitError(result.error ?? 'Billboard creation failed.');
        return;
      }

      setSubmitSuccess('Billboard created and added to inventory.');
      reset();
      setImages([]);
      onCreated?.();
    });
  };

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {submitError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      {submitSuccess ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {submitSuccess}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Billboard Name
          </label>
          <input id="name" className={inputClassName} {...register('name')} />
          {errors.name ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="code" className="text-sm font-medium">
            Billboard Code
          </label>
          <input id="code" className={inputClassName} {...register('code')} />
          {errors.code ? <p className="text-sm text-red-600">{errors.code.message}</p> : null}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
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
          <label htmlFor="type" className="text-sm font-medium">
            Type
          </label>
          <select id="type" className={inputClassName} {...register('type')}>
            <option value={BILLBOARD_TYPES.STATIC}>Static</option>
            <option value={BILLBOARD_TYPES.DIGITAL}>Digital</option>
          </select>
          {errors.type ? <p className="text-sm text-red-600">{errors.type.message}</p> : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select id="status" className={inputClassName} {...register('status')}>
            <option value={BILLBOARD_STATUSES.AVAILABLE}>Available</option>
            <option value={BILLBOARD_STATUSES.RESERVED}>Reserved</option>
            <option value={BILLBOARD_STATUSES.OCCUPIED}>Occupied</option>
            <option value={BILLBOARD_STATUSES.MAINTENANCE}>Maintenance</option>
          </select>
          {errors.status ? <p className="text-sm text-red-600">{errors.status.message}</p> : null}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="address" className="text-sm font-medium">
          Address
        </label>
        <input id="address" className={inputClassName} {...register('location.address')} />
        {errors.location?.address ? (
          <p className="text-sm text-red-600">{errors.location.address.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="city" className="text-sm font-medium">
            City
          </label>
          <input id="city" className={inputClassName} {...register('location.city')} />
          {errors.location?.city ? (
            <p className="text-sm text-red-600">{errors.location.city.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="country" className="text-sm font-medium">
            Country
          </label>
          <input id="country" className={inputClassName} {...register('location.country')} />
          {errors.location?.country ? (
            <p className="text-sm text-red-600">{errors.location.country.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="width" className="text-sm font-medium">
            Width
          </label>
          <input
            id="width"
            type="number"
            step="any"
            className={inputClassName}
            {...register('dimensions.width')}
          />
          {errors.dimensions?.width ? (
            <p className="text-sm text-red-600">{errors.dimensions.width.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="height" className="text-sm font-medium">
            Height
          </label>
          <input
            id="height"
            type="number"
            step="any"
            className={inputClassName}
            {...register('dimensions.height')}
          />
          {errors.dimensions?.height ? (
            <p className="text-sm text-red-600">{errors.dimensions.height.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="unit" className="text-sm font-medium">
            Unit
          </label>
          <select id="unit" className={inputClassName} {...register('dimensions.unit')}>
            <option value={DIMENSION_UNITS.METERS}>Meters (m)</option>
            <option value={DIMENSION_UNITS.FEET}>Feet (ft)</option>
          </select>
          {errors.dimensions?.unit ? (
            <p className="text-sm text-red-600">{errors.dimensions.unit.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="monthlyPrice" className="text-sm font-medium">
            Monthly Price
          </label>
          <input
            id="monthlyPrice"
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
          <label htmlFor="trafficCount" className="text-sm font-medium">
            Traffic Count (optional)
          </label>
          <input
            id="trafficCount"
            type="number"
            min="0"
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
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Images</span>
        <BillboardImageInput value={images} onChange={handleImagesChange} disabled={isPending} />
        {errors.images ? <p className="text-sm text-red-600">{errors.images.message}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? 'Creating billboard...' : 'Create billboard'}
      </button>
    </form>
  );
}
