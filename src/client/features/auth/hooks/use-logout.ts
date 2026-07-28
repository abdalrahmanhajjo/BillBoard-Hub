import { useMutation } from '@tanstack/react-query';
import { logout } from '../api/authApi';
import { ApiResponseError } from '@/shared/types/response';

export const useLogout = () => {
  return useMutation<unknown, ApiResponseError, void>({
    mutationFn: logout,
  });
};
