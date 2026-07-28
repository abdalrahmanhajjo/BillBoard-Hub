'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import { Button } from '@/client/ui/components/ui/button';
import { Input } from '@/client/ui/components/ui/input';
import { Textarea } from '@/client/ui/components/ui/textarea';
import { Label } from '@/client/ui/components/ui/label';
import { campaignClientService } from '@/client/features/campaigns/services/campaign-client.service';
import {
  campaignFormSchema,
  type CampaignFormValues,
} from '@/client/features/campaigns/validations/campaign-form.schema';

type CreateCampaignFormProps = {
  onCreated: () => void | Promise<void>;
};

export function CreateCampaignForm({ onCreated }: CreateCampaignFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: { name: '', description: '', startDate: '', endDate: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const result = await campaignClientService.create({
      name: values.name,
      description: values.description || undefined,
      startDate: values.startDate,
      endDate: values.endDate,
    });

    if (!result.ok) {
      setSubmitError(result.error ?? 'Campaign creation failed.');
      return;
    }

    reset();
    await onCreated();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="campaign-name">Campaign name</Label>
        <Input id="campaign-name" placeholder="Summer Product Launch" {...register('name')} />
        {errors.name ? <p className="text-destructive text-xs">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="campaign-description">Description</Label>
        <Textarea
          id="campaign-description"
          placeholder="What is this campaign about?"
          {...register('description')}
        />
        {errors.description ? (
          <p className="text-destructive text-xs">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="campaign-start-date">Start date</Label>
          <Input id="campaign-start-date" type="date" {...register('startDate')} />
          {errors.startDate ? (
            <p className="text-destructive text-xs">{errors.startDate.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="campaign-end-date">End date</Label>
          <Input id="campaign-end-date" type="date" {...register('endDate')} />
          {errors.endDate ? (
            <p className="text-destructive text-xs">{errors.endDate.message}</p>
          ) : null}
        </div>
      </div>

      {submitError ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {submitError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create campaign'}
      </Button>
    </form>
  );
}
