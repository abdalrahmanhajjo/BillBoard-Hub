import { useMutation } from '@tanstack/react-query';
import { logout } from '../api/authApi';
import type { LogoutResponse } from '@/shared/types/auth';
import { ApiResponseError } from '@/shared/types/response';

export const useLogout = () => {
  return useMutation<LogoutResponse, ApiResponseError, void>({
    mutationFn: logout,
  });
};
