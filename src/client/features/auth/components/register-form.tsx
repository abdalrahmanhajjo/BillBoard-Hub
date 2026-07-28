'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/client/ui/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/client/ui/components/ui/field';
import { Input } from '@/client/ui/components/ui/input';
import { useForm } from 'react-hook-form';
import { useRegister } from '../hooks/use-register';
import { type RegisterSchemaInput, registerSchema } from '@/shared/contracts/auth/register.schema';
import { Alert } from '@/client/ui/components/ui/alert';
import { useLogin } from '../hooks/use-login';
import { ArrowRight, Lock, Mail, UserRound } from 'lucide-react';

export function RegisterForm(props: React.ComponentProps<'div'>) {
  const router = useRouter();
  const registerAccount = useRegister();
  const loginMutation = useLogin();

  const form = useForm<RegisterSchemaInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const submitError = registerAccount.error?.message;
  const loginError = loginMutation.error?.message;

  const onSubmit = async (values: RegisterSchemaInput) => {
    await registerAccount.mutateAsync(values);

    await loginMutation.mutateAsync({
      email: values.email,
      password: values.password,
    });

    form.reset();
    router.push('/dashboard/advertiser');
    router.refresh();
  };

  return (
    <div {...props}>
      <form className="p-0" onSubmit={form.handleSubmit(onSubmit)}>
        {submitError ? (
          <Alert className="mb-4 border-red-200 bg-red-50 text-red-700">{submitError}</Alert>
        ) : null}
        {loginError ? (
          <Alert className="mb-4 border-red-200 bg-red-50 text-red-700">{loginError}</Alert>
        ) : null}
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="first-name">First Name</FieldLabel>
              <div className="relative">
                <UserRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="first-name"
                  className="h-11 pl-10"
                  placeholder="John"
                  disabled={registerAccount.isPending || loginMutation.isPending}
                  {...form.register('firstName')}
                />
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
              <div className="relative">
                <UserRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="last-name"
                  className="h-11 pl-10"
                  placeholder="Smith"
                  disabled={registerAccount.isPending || loginMutation.isPending}
                  {...form.register('lastName')}
                />
              </div>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="email"
                type="email"
                className="h-11 pl-10"
                placeholder="john@example.com"
                disabled={registerAccount.isPending || loginMutation.isPending}
                {...form.register('email')}
              />
            </div>
          </Field>
          <Field>
            <Field className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="user-password">Password</FieldLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="user-password"
                    type="password"
                    className="h-11 pl-10"
                    disabled={registerAccount.isPending || loginMutation.isPending}
                    {...form.register('password')}
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    className="h-11 pl-10"
                    disabled={registerAccount.isPending || loginMutation.isPending}
                    {...form.register('confirmPassword')}
                  />
                </div>
              </Field>
            </Field>
            {form.formState.errors.confirmPassword ? (
              <FieldDescription className="text-red-500">
                {form.formState.errors.confirmPassword.message}
              </FieldDescription>
            ) : null}
          </Field>
          <Field>
            <Button
              type="submit"
              disabled={registerAccount.isPending || loginMutation.isPending}
              className="h-11 w-full gap-2 rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700"
            >
              {registerAccount.isPending || loginMutation.isPending
                ? 'Creating account...'
                : 'Create Account'}
              {!registerAccount.isPending && !loginMutation.isPending ? (
                <ArrowRight className="h-4 w-4" />
              ) : null}
            </Button>
            {registerAccount.isPending || loginMutation.isPending ? (
              <FieldDescription>Creating your account and signing you in...</FieldDescription>
            ) : null}
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
