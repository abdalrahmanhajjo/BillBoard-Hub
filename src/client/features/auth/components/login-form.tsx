'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/client/ui/components/ui/field';
import { Button } from '@/client/ui/components/ui/button';
import { Input } from '@/client/ui/components/ui/input';
import { cn } from '@/client/ui/lib/utils';
import { useLogin } from '../hooks/use-login';
import { Alert } from '@/client/ui/components/ui/alert';
import Link from 'next/link';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const loginMutation = useLogin();

  const form = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginSchemaInput) => {
    try {
      await loginMutation.mutateAsync(values);
      router.push('/user');
      router.refresh();
    } catch {
      // The failure is surfaced to the user via loginMutation.error below;
      // this catch only prevents an unhandled promise rejection.
    }
  };

  return (
    <form
      className={cn('flex flex-col gap-5', className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        {loginMutation.error ? (
          <Alert className="border-red-200 bg-red-50 text-red-700">
            {loginMutation.error.message}
          </Alert>
        ) : null}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              disabled={loginMutation.isPending}
              className="h-11 pl-10"
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email ? (
            <FieldDescription className="text-red-500">
              {form.formState.errors.email.message}
            </FieldDescription>
          ) : null}
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-700 transition-colors hover:text-blue-600"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="password"
              type="password"
              disabled={loginMutation.isPending}
              className="h-11 pl-10"
              {...form.register('password')}
            />
          </div>
          {form.formState.errors.password ? (
            <FieldDescription className="text-red-500">
              {form.formState.errors.password.message}
            </FieldDescription>
          ) : null}
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="h-11 w-full gap-2 rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
            {!loginMutation.isPending ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
          <FieldDescription className="mt-1 text-xs text-zinc-500">
            You will be redirected to your role dashboard after sign in.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
