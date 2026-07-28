import { useMutation } from '@tanstack/react-query';
import { getSession } from '../api/authApi';
import type { MeResponse } from '@/shared/types/auth';
import { ApiResponseError } from '@/shared/types/response';

export const useSession = () => {
  return useMutation<MeResponse, ApiResponseError, void>({
    mutationFn: getSession,
  });
};
