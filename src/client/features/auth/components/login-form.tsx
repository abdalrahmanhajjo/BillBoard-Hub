'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail } from 'lucide-react';
import { loginSchema, type LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import { AuthAlert } from '@/client/features/auth/components/auth-alert';
import { AuthPasswordField } from '@/client/features/auth/components/auth-password-field';
import { AuthSubmitButton } from '@/client/features/auth/components/auth-submit-button';
import { AuthTextField } from '@/client/features/auth/components/auth-text-field';
import { useLogin } from '@/client/features/auth/hooks/use-login';

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  const form = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    // Validate once a field has been left, then keep it live while it is being
    // corrected — no red text before the user has finished typing.
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { errors } = form.formState;

  const onSubmit = async (values: LoginSchemaInput) => {
    try {
      await loginMutation.mutateAsync(values);
      router.push('/');
      router.refresh();
    } catch {
      // Surfaced through loginMutation.error below; this catch only prevents an
      // unhandled promise rejection.
    }
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {loginMutation.error ? (
        <AuthAlert title="We could not sign you in">{loginMutation.error.message}</AuthAlert>
      ) : null}

      <AuthTextField
        id="login-email"
        label="Email"
        type="email"
        inputMode="email"
        icon={Mail}
        placeholder="name@company.com"
        autoComplete="email"
        autoFocus
        disabled={loginMutation.isPending}
        error={errors.email?.message}
        {...form.register('email')}
      />

      <AuthPasswordField
        id="login-password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        disabled={loginMutation.isPending}
        error={errors.password?.message}
        labelAction={
          <Link
            href="/forgot-password"
            className="text-primary focus-visible:ring-ring/50 rounded text-xs font-medium hover:underline focus-visible:ring-3 focus-visible:outline-none"
          >
            Forgot password?
          </Link>
        }
        {...form.register('password')}
      />

      <AuthSubmitButton pending={loginMutation.isPending} pendingLabel="Signing in...">
        Sign in
        <ArrowRight className="size-4" aria-hidden />
      </AuthSubmitButton>
    </form>
  );
}
