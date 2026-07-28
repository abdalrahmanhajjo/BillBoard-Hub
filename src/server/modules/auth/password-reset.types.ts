export interface PasswordResetTokenRecord {
  userId: string;
  /** SHA-256 of the token that was emailed; the raw token is never stored. */
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  /** Coarse client key kept for abuse triage, not for authorization. */
  requestedFrom?: string;
}
