'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import { authClientService } from '@/client/features/auth/services/auth-client.service';
import { Button } from '@/client/ui/components/ui/button';
import { Input } from '@/client/ui/components/ui/input';
import { Label } from '@/client/ui/components/ui/label';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginSchemaInput) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await authClientService.login(values);
      if (!result.ok) {
        setSubmitError(result.error ?? 'Login failed.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    });
  };

  return (
    <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {submitError ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <div className="space-y-1">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="h-11 w-full rounded-lg border-zinc-300 px-3"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="login-email-error" className="text-sm text-red-600">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="h-11 w-full rounded-lg border-zinc-300 px-3"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          {...register('password')}
        />
        {errors.password ? (
          <p id="login-password-error" className="text-sm text-red-600">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="min-h-11 w-full rounded-lg bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
