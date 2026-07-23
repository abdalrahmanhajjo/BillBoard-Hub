'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import { authClientService } from '@/client/features/auth/services/auth-client.service';

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
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          {...register('email')}
        />
        {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          {...register('password')}
        />
        {errors.password ? <p className="text-sm text-red-600">{errors.password.message}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
