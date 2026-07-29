import { RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';
import { useMutation } from '@tanstack/react-query';
import type { ApiResponseError } from '@/shared/types/response';
import { register } from '../api/authApi';

export const useRegister = () => {
  return useMutation<unknown, ApiResponseError, RegisterSchemaInput>({
    mutationFn: register,
  });
};
