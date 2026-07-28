'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/client/ui/components/ui/button';
import { Input } from '@/client/ui/components/ui/input';
import { WorkspacePage } from '@/client/features/dashboard/components/workspace-page';
import { userClientService } from '@/client/features/users/services/user-client.service';
import {
  updateUserInfoSchema,
  type UpdateUserInfoSchemaInput,
} from '@/shared/contracts/user/user.schema';
import type { User } from '@/shared/types/user';

export function AdvertiserProfileFeaturePage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<UpdateUserInfoSchemaInput>({
    resolver: zodResolver(updateUserInfoSchema),
    mode: 'onTouched',
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  const { reset } = form;

  useEffect(() => {
    let active = true;

    void (async () => {
      const result = await userClientService.getCurrentUser();
      if (!active) return;

      if (!result.ok || !result.data?.user) {
        setLoadError(result.error ?? 'We could not load your profile. Try again.');
        setStatus('error');
        return;
      }

      const current = result.data.user;
      setUser(current);
      reset({
        firstName: current.firstName,
        lastName: current.lastName,
        email: current.email,
      });
      setStatus('ready');
    })();

    return () => {
      active = false;
    };
  }, [reset]);

  const onSubmit = async (values: UpdateUserInfoSchemaInput) => {
    if (!user) return;

    setSaveError(null);
    setSaved(false);

    const result = await userClientService.updateProfile(user.id, values);
    if (!result.ok) {
      setSaveError(result.error ?? 'We could not save your profile. Try again.');
      return;
    }

    setSaved(true);
  };

  const { errors, isSubmitting } = form.formState;

  return (
    <WorkspacePage
      title="Profile"
      description="The name and email used on your reservations and billing records."
    >
      {status === 'loading' ? (
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading profile...
        </div>
      ) : status === 'error' ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/8 text-destructive flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{loadError}</span>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-card max-w-xl space-y-5 rounded-xl border p-5"
        >
          {saveError ? (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive/8 text-destructive flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{saveError}</span>
            </div>
          ) : null}

          {saved ? (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>Profile updated.</span>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <ProfileField
              id="profile-first-name"
              label="First name"
              error={errors.firstName?.message}
              {...form.register('firstName')}
            />
            <ProfileField
              id="profile-last-name"
              label="Last name"
              error={errors.lastName?.message}
              {...form.register('lastName')}
            />
          </div>

          <ProfileField
            id="profile-email"
            label="Email"
            type="email"
            error={errors.email?.message}
            {...form.register('email')}
          />

          <div className="text-muted-foreground grid gap-1 text-xs">
            <span>
              Role: <span className="text-foreground font-medium capitalize">{user?.role}</span>
            </span>
            <span>
              Status:{' '}
              <span className="text-foreground font-medium">
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>

          <Button type="submit" disabled={isSubmitting} className="h-10 gap-2">
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      )}
    </WorkspacePage>
  );
}

type ProfileFieldProps = Omit<React.ComponentProps<'input'>, 'id'> & {
  id: string;
  label: string;
  error?: string;
};

function ProfileField({ id, label, error, ...props }: ProfileFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        className="h-10"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}
