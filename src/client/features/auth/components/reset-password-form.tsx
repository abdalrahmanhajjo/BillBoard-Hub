'use client';

import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import {
  resetPasswordSchema,
  type ResetPasswordSchemaInput,
} from '@/shared/contracts/auth/password-reset.schema';
import { Button } from '@/client/ui/components/ui/button';
import { AuthAlert } from '@/client/features/auth/components/auth-alert';
import { AuthPasswordField } from '@/client/features/auth/components/auth-password-field';
import { AuthSubmitButton } from '@/client/features/auth/components/auth-submit-button';
import { PasswordStrengthMeter } from '@/client/features/auth/components/password-strength-meter';
import { useResetPassword } from '@/client/features/auth/hooks/use-reset-password';

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordSchemaInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const { errors } = form.formState;
  const passwordValue = useWatch({ control: form.control, name: 'password' }) ?? '';

  const onSubmit = async (values: ResetPasswordSchemaInput) => {
    try {
      await resetPassword.mutateAsync(values);
    } catch {
      // Surfaced through resetPassword.error below.
    }
  };

  if (resetPassword.isSuccess) {
    return (
      <div className="space-y-5">
        <AuthAlert variant="success" title="Password updated">
          {resetPassword.data?.message ?? 'Sign in with your new password to continue.'}
        </AuthAlert>

        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          className="h-11 w-full gap-2 rounded-xl text-sm font-semibold"
        >
          Continue to sign in
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {resetPassword.error ? (
        <AuthAlert title="We could not update your password">
          {resetPassword.error.message}
        </AuthAlert>
      ) : null}

      {/* Carried in the form so the token travels with the submission rather
          than being re-read from the URL at submit time. */}
      <input type="hidden" {...form.register('token')} />

      <div className="space-y-2">
        <AuthPasswordField
          id="reset-password"
          label="New password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          autoFocus
          disabled={resetPassword.isPending}
          error={errors.password?.message ?? errors.token?.message}
          {...form.register('password')}
        />
        <PasswordStrengthMeter value={passwordValue} />
      </div>

      <AuthPasswordField
        id="reset-confirm-password"
        label="Confirm new password"
        placeholder="Re-enter your new password"
        autoComplete="new-password"
        disabled={resetPassword.isPending}
        error={errors.confirmPassword?.message}
        {...form.register('confirmPassword')}
      />

      <AuthSubmitButton pending={resetPassword.isPending} pendingLabel="Updating password...">
        <ShieldCheck className="size-4" aria-hidden />
        Update password
      </AuthSubmitButton>
    </form>
  );
}
