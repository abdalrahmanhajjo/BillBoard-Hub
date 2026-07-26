import { LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import type { LoginResponse } from '@/shared/types/auth';
import { useMutation } from '@tanstack/react-query';
import type { ApiResponseError } from '@/shared/types/response';
import { login } from '../api/authApi';

export const useLogin = () => {
  return useMutation<LoginResponse, ApiResponseError, LoginSchemaInput>({
    mutationFn: login,
  });
};
