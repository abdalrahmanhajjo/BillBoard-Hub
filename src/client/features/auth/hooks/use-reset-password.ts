import { useMutation, useQuery } from '@tanstack/react-query';
import type { ResetPasswordSchemaInput } from '@/shared/contracts/auth/password-reset.schema';
import { resetPassword, verifyResetToken } from '../api/authApi';

export const useResetPassword = () => {
  return useMutation<{ message: string } | undefined, Error, ResetPasswordSchemaInput>({
    mutationFn: resetPassword,
  });
};

/**
 * Checks the link once on mount. Retrying would not change the verdict — an
 * expired token stays expired — so a failed check settles as "unusable".
 */
export const useResetTokenCheck = (token: string) => {
  return useQuery({
    queryKey: ['auth', 'reset-token', token],
    queryFn: () => verifyResetToken(token),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};
