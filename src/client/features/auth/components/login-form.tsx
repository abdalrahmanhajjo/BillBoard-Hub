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
      router.push('/dashboard');
      router.refresh();
    } catch {}
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        {loginMutation.error ? (
          <Alert className="text-red-500">
            {loginMutation.error.message}
          </Alert>
        ) : null}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            disabled={loginMutation.isPending}
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <FieldDescription className="text-red-500">
              {form.formState.errors.email.message}
            </FieldDescription>
          ) : null}
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input
            id="password"
            type="password"
            disabled={loginMutation.isPending}
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <FieldDescription className="text-red-500">
              {form.formState.errors.password.message}
            </FieldDescription>
          ) : null}
        </Field>
        <Field>
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
