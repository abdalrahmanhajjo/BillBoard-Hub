'use client';

import Link from 'next/link';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail, UserRound } from 'lucide-react';
import {
  registerAccountSchema,
  type RegisterAccountSchemaInput,
} from '@/shared/contracts/auth/register.schema';
import { Checkbox } from '@/client/ui/components/ui/checkbox';
import { AuthPasswordField } from '@/client/features/auth/components/auth-password-field';
import { AuthSubmitButton } from '@/client/features/auth/components/auth-submit-button';
import { AuthTextField } from '@/client/features/auth/components/auth-text-field';
import { PasswordStrengthMeter } from '@/client/features/auth/components/password-strength-meter';

type RegisterAccountStepProps = {
  /** Re-seeds the fields when stepping back, so nothing typed is lost. */
  defaultValues: RegisterAccountSchemaInput;
  disabled: boolean;
  onSubmit: (values: RegisterAccountSchemaInput) => void;
};

export function RegisterAccountStep({
  defaultValues,
  disabled,
  onSubmit,
}: RegisterAccountStepProps) {
  const form = useForm<RegisterAccountSchemaInput>({
    resolver: zodResolver(registerAccountSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const { errors } = form.formState;
  const passwordValue = useWatch({ control: form.control, name: 'password' }) ?? '';

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthTextField
          id="register-first-name"
          label="First name"
          icon={UserRound}
          placeholder="Jamie"
          autoComplete="given-name"
          autoFocus
          disabled={disabled}
          error={errors.firstName?.message}
          {...form.register('firstName')}
        />
        <AuthTextField
          id="register-last-name"
          label="Last name"
          icon={UserRound}
          placeholder="Rivera"
          autoComplete="family-name"
          disabled={disabled}
          error={errors.lastName?.message}
          {...form.register('lastName')}
        />
      </div>

      <AuthTextField
        id="register-email"
        label="Work email"
        type="email"
        inputMode="email"
        icon={Mail}
        placeholder="jamie@company.com"
        autoComplete="email"
        disabled={disabled}
        error={errors.email?.message}
        hint="We send booking approvals and campaign updates here."
        {...form.register('email')}
      />

      <div className="space-y-2">
        <AuthPasswordField
          id="register-password"
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          disabled={disabled}
          error={errors.password?.message}
          {...form.register('password')}
        />
        <PasswordStrengthMeter value={passwordValue} />
      </div>

      <AuthPasswordField
        id="register-confirm-password"
        label="Confirm password"
        placeholder="Re-enter your password"
        autoComplete="new-password"
        disabled={disabled}
        error={errors.confirmPassword?.message}
        {...form.register('confirmPassword')}
      />

      <div className="space-y-1.5">
        <div className="flex items-start gap-2.5">
          <Controller
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <Checkbox
                id="register-accept-terms"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                disabled={disabled}
                aria-invalid={errors.acceptTerms ? true : undefined}
                aria-describedby={errors.acceptTerms ? 'register-accept-terms-error' : undefined}
                className="mt-0.5"
              />
            )}
          />
          <label
            htmlFor="register-accept-terms"
            className="text-muted-foreground text-sm leading-relaxed"
          >
            I agree to the{' '}
            <Link
              href="/terms"
              className="text-foreground font-medium underline underline-offset-4"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-foreground font-medium underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {errors.acceptTerms ? (
          <p
            id="register-accept-terms-error"
            role="alert"
            className="text-destructive text-xs leading-relaxed font-medium"
          >
            {errors.acceptTerms.message}
          </p>
        ) : null}
      </div>

      <AuthSubmitButton pending={false} pendingLabel="" disabled={disabled}>
        Continue
        <ArrowRight className="size-4" aria-hidden />
      </AuthSubmitButton>
    </form>
  );
}
