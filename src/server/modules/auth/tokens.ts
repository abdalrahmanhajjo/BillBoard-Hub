import { randomBytes } from 'node:crypto';

export const ACCESS_TOKEN_TTL_MS = parseInt(process.env.ACCESS_TOKEN_TTL_MS!);
export const REFRESH_TOKEN_TTL_MS = parseInt(process.env.REFRESH_TOKEN_TTL_MS!);

export function createOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}
