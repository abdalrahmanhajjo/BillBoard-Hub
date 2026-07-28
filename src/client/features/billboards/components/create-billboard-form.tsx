'use client';

import { useState, useTransition } from 'react';
import { useForm, useWatch, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createBillboardSchema } from '@/shared/contracts/billboard/billboard.schema';
import {
  upsertDigitalSpecSchema,
  type UpsertDigitalSpecSchemaInput,
} from '@/shared/contracts/billboard/digital-spec.schema';
import {
  BILLBOARD_STATUSES,
  BILLBOARD_TYPES,
  DIMENSION_UNITS,
  SCREEN_STATUSES,
} from '@/shared/constants/billboard';
import type { Billboard } from '@/shared/types/billboard';
import { billboardClientService } from '@/client/features/billboards/services/billboard-client.service';
import { BillboardImageInput } from '@/client/features/billboards/components/billboard-image-input';
import { FormStatusMessages } from '@/client/features/billboards/components/form-status-messages';

type CreateBillboardFormProps = {
  onCreated?: () => void;
};

// Client form schema: the base billboard fields plus the (raw string) digital
// spec fields. The spec is only validated/sent when Type is Digital.
const digitalSpecFieldsSchema = z.object({
  resolution: z.object({ width: z.string(), height: z.string() }),
  brightness: z.string(),
  slotDurationSeconds: z.string(),
  rotatingAdsCount: z.string(),
  screenStatus: z.enum(SCREEN_STATUSES),
});

const createBillboardFormSchema = createBillboardSchema.extend({
  digitalSpec: digitalSpecFieldsSchema.optional(),
});

type CreateBillboardFormInput = z.input<typeof createBillboardFormSchema>;

const inputClassName = 'w-full rounded-md border border-zinc-300 px-3 py-2';

export function CreateBillboardForm({ onCreated }: CreateBillboardFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreateBillboardFormInput>({
    resolver: zodResolver(createBillboardFormSchema),
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
      digitalSpec: {
        resolution: { width: '', height: '' },
        brightness: '',
        slotDurationSeconds: '',
        rotatingAdsCount: '',
        screenStatus: SCREEN_STATUSES.OFF,
      },
    },
  });

  const isDigital = useWatch({ control, name: 'type' }) === BILLBOARD_TYPES.DIGITAL;

  const handleImagesChange = (next: string[]) => {
    setImages(next);
    setValue('images', next, { shouldValidate: true });
  };

  const onSubmit = (values: CreateBillboardFormInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const creatingDigital = values.type === BILLBOARD_TYPES.DIGITAL;

    // Validate the screen specs up front so we never create a digital billboard
    // without its specification.
    let specPayload: UpsertDigitalSpecSchemaInput | null = null;
    if (creatingDigital) {
      const parsed = upsertDigitalSpecSchema.safeParse(values.digitalSpec);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          setError(`digitalSpec.${issue.path.join('.')}` as FieldPath<CreateBillboardFormInput>, {
            message: issue.message,
          });
        });
        return;
      }
      specPayload = values.digitalSpec as UpsertDigitalSpecSchemaInput;
    }

    // Re-parse with the transport contract to strip the client-only digitalSpec
    // and apply the same transforms used by the server.
    const billboardPayload = createBillboardSchema.parse(values);

    startTransition(async () => {
      const result = await billboardClientService.create(billboardPayload);
      if (!result.ok) {
        setSubmitError(
          result.error ?? 'We could not add this billboard. Review the form and try again.',
        );
        return;
      }

      const created = result.data as Billboard | undefined;

      if (creatingDigital && specPayload && created?.id) {
        const specResult = await billboardClientService.saveDigitalSpec(created.id, specPayload);
        if (!specResult.ok) {
          setSubmitError(
            `The billboard was created, but its screen specifications were not saved. ${
              specResult.error ?? 'Open Digital specifications and add them there.'
            }`,
          );
          onCreated?.();
          return;
        }
      }

      setSubmitSuccess(
        creatingDigital
          ? 'Digital billboard created with its screen specifications.'
          : 'Billboard created and added to inventory.',
      );
      reset();
      setImages([]);
      onCreated?.();
    });
  };

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <FormStatusMessages error={submitError} success={submitSuccess} />

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
            Monthly Traffic
          </label>
          <input
            id="trafficCount"
            type="number"
            min="1"
            step="1"
            required
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

      {isDigital ? (
        <fieldset className="space-y-4 rounded-md border border-blue-200 bg-blue-50/40 p-4">
          <legend className="px-1 text-sm font-semibold text-blue-700">
            Digital screen specifications
          </legend>

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
                {...register('digitalSpec.resolution.width')}
              />
              {errors.digitalSpec?.resolution?.width ? (
                <p className="text-sm text-red-600">
                  {errors.digitalSpec.resolution.width.message}
                </p>
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
                {...register('digitalSpec.resolution.height')}
              />
              {errors.digitalSpec?.resolution?.height ? (
                <p className="text-sm text-red-600">
                  {errors.digitalSpec.resolution.height.message}
                </p>
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
                {...register('digitalSpec.brightness')}
              />
              {errors.digitalSpec?.brightness ? (
                <p className="text-sm text-red-600">{errors.digitalSpec.brightness.message}</p>
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
                {...register('digitalSpec.slotDurationSeconds')}
              />
              {errors.digitalSpec?.slotDurationSeconds ? (
                <p className="text-sm text-red-600">
                  {errors.digitalSpec.slotDurationSeconds.message}
                </p>
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
                {...register('digitalSpec.rotatingAdsCount')}
              />
              {errors.digitalSpec?.rotatingAdsCount ? (
                <p className="text-sm text-red-600">
                  {errors.digitalSpec.rotatingAdsCount.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="screenStatus" className="text-sm font-medium">
                Screen Status
              </label>
              <select
                id="screenStatus"
                className={inputClassName}
                {...register('digitalSpec.screenStatus')}
              >
                <option value={SCREEN_STATUSES.ON}>On</option>
                <option value={SCREEN_STATUSES.OFF}>Off</option>
                <option value={SCREEN_STATUSES.STANDBY}>Standby</option>
                <option value={SCREEN_STATUSES.FAULT}>Fault</option>
              </select>
              {errors.digitalSpec?.screenStatus ? (
                <p className="text-sm text-red-600">{errors.digitalSpec.screenStatus.message}</p>
              ) : null}
            </div>
          </div>
        </fieldset>
      ) : null}

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
        {isPending
          ? 'Creating billboard...'
          : isDigital
            ? 'Create digital billboard'
            : 'Create billboard'}
      </button>
    </form>
  );
}
