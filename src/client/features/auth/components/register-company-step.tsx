'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Building2, MapPin, Phone } from 'lucide-react';
import {
  registerCompanySchema,
  type RegisterCompanySchemaInput,
} from '@/shared/contracts/auth/register.schema';
import { Button } from '@/client/ui/components/ui/button';
import { AuthSubmitButton } from '@/client/features/auth/components/auth-submit-button';
import { AuthTextField } from '@/client/features/auth/components/auth-text-field';

type RegisterCompanyStepProps = {
  /** Preserved across a step change so returning here does not clear the fields. */
  defaultValues: RegisterCompanySchemaInput;
  pending: boolean;
  onBack: (values: RegisterCompanySchemaInput) => void;
  onSubmit: (values: RegisterCompanySchemaInput) => void;
};

export function RegisterCompanyStep({
  defaultValues,
  pending,
  onBack,
  onSubmit,
}: RegisterCompanyStepProps) {
  const form = useForm<RegisterCompanySchemaInput>({
    resolver: zodResolver(registerCompanySchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const { errors } = form.formState;

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <AuthTextField
        id="register-company-name"
        label="Company name"
        icon={Building2}
        placeholder="Rivera Media Group"
        autoComplete="organization"
        autoFocus
        disabled={pending}
        error={errors.companyName?.message}
        hint="Shown to operators reviewing your booking requests."
        {...form.register('companyName')}
      />

      <AuthTextField
        id="register-company-phone"
        label="Phone number"
        type="tel"
        inputMode="tel"
        icon={Phone}
        placeholder="+1 555 0123"
        autoComplete="tel"
        disabled={pending}
        error={errors.phone?.message}
        {...form.register('phone')}
      />

      <AuthTextField
        id="register-company-address"
        label="Business address"
        icon={MapPin}
        placeholder="120 Market Street, San Francisco, CA"
        autoComplete="street-address"
        disabled={pending}
        error={errors.address?.message}
        {...form.register('address')}
      />

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <AuthSubmitButton
          pending={pending}
          pendingLabel="Creating your account..."
          className="sm:flex-1"
        >
          Create advertiser account
          <ArrowRight className="size-4" aria-hidden />
        </AuthSubmitButton>

        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onBack(form.getValues())}
          className="h-11 gap-2 rounded-xl text-sm font-semibold sm:w-auto"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>
      </div>
    </form>
  );
}
