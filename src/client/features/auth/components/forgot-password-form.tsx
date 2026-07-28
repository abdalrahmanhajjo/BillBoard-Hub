'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Mail, SendHorizontal } from 'lucide-react';
import {
  forgotPasswordSchema,
  type ForgotPasswordSchemaInput,
} from '@/shared/contracts/auth/password-reset.schema';
import { Button } from '@/client/ui/components/ui/button';
import { AuthAlert } from '@/client/features/auth/components/auth-alert';
import { AuthSubmitButton } from '@/client/features/auth/components/auth-submit-button';
import { AuthTextField } from '@/client/features/auth/components/auth-text-field';
import { useForgotPassword } from '@/client/features/auth/hooks/use-forgot-password';

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordSchemaInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '' },
  });

  const { errors } = form.formState;
  const submittedEmail = form.getValues('email');
  const previewUrl = forgotPassword.data?.previewUrl;
  const previewNote = forgotPassword.data?.previewNote;

  const onSubmit = async (values: ForgotPasswordSchemaInput) => {
    try {
      await forgotPassword.mutateAsync(values);
    } catch {
      // Surfaced through forgotPassword.error below.
    }
  };

  if (forgotPassword.isSuccess) {
    return (
      <div className="space-y-5">
        <AuthAlert variant="success" title="Check your inbox">
          {forgotPassword.data?.message ??
            'If that email address has an account, a reset link is on its way.'}
        </AuthAlert>

        <div className="border-border bg-muted/40 rounded-xl border px-4 py-3.5">
          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent instructions to{' '}
            <span className="text-foreground font-medium break-all">{submittedEmail}</span>. The
            link expires in one hour and can only be used once.
          </p>
        </div>

        {/* Local development only: the server returns the link when no mail
            provider is configured, so the flow stays completable without an
            inbox. It is never returned once RESEND_API_KEY is set or in
            production. */}
        {previewUrl || previewNote ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3.5 dark:bg-amber-950/30">
            <p className="text-xs font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300">
              Development mode — no email provider configured
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-900/85 dark:text-amber-200/85">
              {previewUrl
                ? 'No message was actually sent. Use this link to continue, or set RESEND_API_KEY to deliver real email.'
                : previewNote}
            </p>
            {previewUrl ? (
              <Button
                render={<Link href={previewUrl} />}
                nativeButton={false}
                className="mt-3 h-10 w-full rounded-lg text-sm font-semibold"
              >
                Open reset link
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => forgotPassword.reset()}
          >
            Use a different email
          </Button>
          <Button render={<Link href="/login" />} nativeButton={false} className="h-11 rounded-xl">
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {forgotPassword.error ? (
        <AuthAlert title="We could not send the reset link">
          {forgotPassword.error.message}
        </AuthAlert>
      ) : null}

      <AuthTextField
        id="forgot-email"
        label="Email"
        type="email"
        inputMode="email"
        icon={Mail}
        placeholder="name@company.com"
        autoComplete="email"
        autoFocus
        disabled={forgotPassword.isPending}
        error={errors.email?.message}
        hint="Use the address you signed up with."
        {...form.register('email')}
      />

      <AuthSubmitButton pending={forgotPassword.isPending} pendingLabel="Sending link...">
        Send reset link
        <SendHorizontal className="size-4" aria-hidden />
      </AuthSubmitButton>

      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to sign in
      </Link>
    </form>
  );
}
