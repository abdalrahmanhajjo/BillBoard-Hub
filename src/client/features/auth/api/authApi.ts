import { LoginResponse, LogoutResponse, MeResponse, RegisterResponse } from '@/shared/types/auth';
import type { LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import { RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';
import { getResponse } from '@/client/lib/response-utils';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/auth`;

export const getSession = async (): Promise<MeResponse> => {
  const response = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return getResponse<MeResponse>(response);
};

export const login = async (input: LoginSchemaInput): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return getResponse<LoginResponse>(response);
};

export const register = async (input: RegisterSchemaInput): Promise<RegisterResponse> => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return getResponse<RegisterResponse>(response);
};

export const logout = async (): Promise<LogoutResponse> => {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return getResponse<LogoutResponse>(response);
};
