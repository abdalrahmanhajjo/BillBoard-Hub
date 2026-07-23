'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';
import { authClientService } from '@/client/features/auth/services/auth-client.service';

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterSchemaInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: RegisterSchemaInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    startTransition(async () => {
      const result = await authClientService.register(values);
      if (!result.ok) {
        setSubmitError(result.error ?? 'Registration failed.');
        return;
      }

      setSubmitSuccess('Account created. You can now sign in.');
      reset();
    });
  };

  return (
    <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

      <div className="space-y-1">
        <label htmlFor="firstName" className="text-sm font-medium">
          First Name
        </label>
        <input
          id="firstName"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          {...register('firstName')}
        />
        {errors.firstName ? (
          <p className="text-sm text-red-600">{errors.firstName.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="lastName" className="text-sm font-medium">
          Last Name
        </label>
        <input
          id="lastName"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          {...register('lastName')}
        />
        {errors.lastName ? <p className="text-sm text-red-600">{errors.lastName.message}</p> : null}
      </div>

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
          autoComplete="new-password"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          {...register('password')}
        />
        {errors.password ? <p className="text-sm text-red-600">{errors.password.message}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {isPending ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
