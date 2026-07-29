import type { ApiResponse } from './response';
import type { UserRole } from './user';

export type UserDirectoryEntry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  /** ISO timestamp of account creation; null on records predating timestamps. */
  joinedAt: string | null;
  updatedAt: string | null;
  /** Advertiser accounts only, from their company profile. */
  companyName: string | null;
};

export type UserDirectorySummary = {
  total: number;
  admins: number;
  advertisers: number;
  active: number;
  inactive: number;
};

export type UserDirectory = {
  users: UserDirectoryEntry[];
  summary: UserDirectorySummary;
};

export type UserDirectoryResponse = ApiResponse<{ directory: UserDirectory }>;
