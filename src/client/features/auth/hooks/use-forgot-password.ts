import { useMutation } from '@tanstack/react-query';
import type { ForgotPasswordSchemaInput } from '@/shared/contracts/auth/password-reset.schema';
import { requestPasswordReset } from '../api/authApi';

type ForgotPasswordResult = { message: string; previewUrl?: string; previewNote?: string };

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResult | undefined, Error, ForgotPasswordSchemaInput>({
    mutationFn: requestPasswordReset,
  });
};
