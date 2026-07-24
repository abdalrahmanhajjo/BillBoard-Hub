'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';
import { authClientService } from '@/client/features/auth/services/auth-client.service';
import { Button } from '@/client/ui/components/ui/button';
import { Input } from '@/client/ui/components/ui/input';
import { Label } from '@/client/ui/components/ui/label';

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
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      {submitSuccess ? (
        <p
          className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
          role="status"
        >
          {submitSuccess}
        </p>
      ) : null}

      <div className="space-y-1">
        <Label htmlFor="firstName" className="text-sm font-medium">
          First Name
        </Label>
        <Input
          id="firstName"
          autoComplete="given-name"
          className="h-11 w-full rounded-lg border-zinc-300 px-3"
          aria-invalid={Boolean(errors.firstName)}
          {...register('firstName')}
        />
        {errors.firstName ? (
          <p className="text-sm text-red-600">{errors.firstName.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="lastName" className="text-sm font-medium">
          Last Name
        </Label>
        <Input
          id="lastName"
          autoComplete="family-name"
          className="h-11 w-full rounded-lg border-zinc-300 px-3"
          aria-invalid={Boolean(errors.lastName)}
          {...register('lastName')}
        />
        {errors.lastName ? <p className="text-sm text-red-600">{errors.lastName.message}</p> : null}
      </div>

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
          {...register('email')}
        />
        {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          className="h-11 w-full rounded-lg border-zinc-300 px-3"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password ? <p className="text-sm text-red-600">{errors.password.message}</p> : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="h-11 w-full rounded-lg border-zinc-300 px-3"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="min-h-11 w-full rounded-lg bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
