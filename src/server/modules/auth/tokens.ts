import { randomBytes } from 'node:crypto';

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const ACCESS_TOKEN_TTL_MS = positiveInteger(process.env.ACCESS_TOKEN_TTL_MS, 15 * 60 * 1000);
export const REFRESH_TOKEN_TTL_MS = positiveInteger(
  process.env.REFRESH_TOKEN_TTL_MS,
  30 * 24 * 60 * 60 * 1000,
);

export function createOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}
