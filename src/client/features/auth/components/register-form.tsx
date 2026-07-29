'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  RegisterAccountSchemaInput,
  RegisterCompanySchemaInput,
} from '@/shared/contracts/auth/register.schema';
import { AuthAlert } from '@/client/features/auth/components/auth-alert';
import { RegisterAccountStep } from '@/client/features/auth/components/register-account-step';
import { RegisterCompanyStep } from '@/client/features/auth/components/register-company-step';
import { RegisterStepIndicator } from '@/client/features/auth/components/register-step-indicator';
import { useLogin } from '@/client/features/auth/hooks/use-login';
import { useRegister } from '@/client/features/auth/hooks/use-register';

const EMPTY_ACCOUNT: RegisterAccountSchemaInput = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

const EMPTY_COMPANY: RegisterCompanySchemaInput = {
  companyName: '',
  phone: '',
  address: '',
};

/**
 * Two steps, one request. The account and the advertiser profile are collected
 * separately because asking for company details alongside a password reads as
 * one long form, but they are submitted together — the API creates both or
 * neither, so there is no point at which a step is "saved" on its own.
 */
export function RegisterForm() {
  const router = useRouter();
  const registerAccount = useRegister();
  const loginMutation = useLogin();

  const [step, setStep] = useState<'account' | 'company'>('account');
  const [account, setAccount] = useState<RegisterAccountSchemaInput>(EMPTY_ACCOUNT);
  const [company, setCompany] = useState<RegisterCompanySchemaInput>(EMPTY_COMPANY);

  const isPending = registerAccount.isPending || loginMutation.isPending;
  const submitError = registerAccount.error?.message ?? loginMutation.error?.message;

  const handleAccountSubmit = (values: RegisterAccountSchemaInput) => {
    setAccount(values);
    setStep('company');
  };

  const handleBack = (values: RegisterCompanySchemaInput) => {
    setCompany(values);
    setStep('account');
  };

  const handleCompanySubmit = async (values: RegisterCompanySchemaInput) => {
    setCompany(values);

    try {
      await registerAccount.mutateAsync({ ...account, ...values });
      // Sign in straight away so a new advertiser lands in the workspace rather
      // than on the sign-in screen they just filled a form to skip.
      await loginMutation.mutateAsync({ email: account.email, password: account.password });

      setAccount(EMPTY_ACCOUNT);
      setCompany(EMPTY_COMPANY);
      router.push('/');
      router.refresh();
    } catch {
      // Surfaced through submitError below.
    }
  };

  return (
    <div className="space-y-6">
      <RegisterStepIndicator
        current={step}
        steps={[
          { id: 'account', label: 'Your details' },
          { id: 'company', label: 'Company' },
        ]}
      />

      {submitError ? (
        <AuthAlert title="We could not create your account">{submitError}</AuthAlert>
      ) : null}

      {step === 'account' ? (
        <RegisterAccountStep
          defaultValues={account}
          disabled={isPending}
          onSubmit={handleAccountSubmit}
        />
      ) : (
        <RegisterCompanyStep
          defaultValues={company}
          pending={isPending}
          onBack={handleBack}
          onSubmit={handleCompanySubmit}
        />
      )}
    </div>
  );
}
