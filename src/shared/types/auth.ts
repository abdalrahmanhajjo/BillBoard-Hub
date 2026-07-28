import { ApiResponse } from './response';
import { User } from './user';

export type LoginResponse = ApiResponse<undefined>;
export type LogoutResponse = ApiResponse<undefined>;
export type MeResponse = ApiResponse<{
  user: User;
  accessToken: string;
  accessTokenExpires: number;
  sessionError?: string;
}>;

export type RefreshResponse = ApiResponse<{
  accessToken: string;
  accessTokenExpires: number;
}>;

export type RegisterResponse = ApiResponse<User>;
