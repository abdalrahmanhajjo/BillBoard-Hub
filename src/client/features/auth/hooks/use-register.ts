import { RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';
import type { RegisterResponse } from '@/shared/types/auth';
import { useMutation } from '@tanstack/react-query';
import type { ApiResponseError } from '@/shared/types/response';
import { register } from '../api/authApi';

export const useRegister = () => {
  return useMutation<RegisterResponse, ApiResponseError, RegisterSchemaInput>({
    mutationFn: register,
  });
};
