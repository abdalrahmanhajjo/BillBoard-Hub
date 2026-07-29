/** Shared recovery-focused copy used at client and server boundaries. */
export const USER_MESSAGES = {
  invalidResponse: 'We received an unexpected response. Try again.',
  networkUnavailable: 'We could not reach the server. Check your connection and try again.',
  requestFailed: 'We could not complete your request. Try again.',
  sessionRequired: 'Your session has expired. Sign in again to continue.',
  invalidCredentials: 'The email or password is incorrect. Check both fields and try again.',
  notFound: 'We could not find that item. It may have been removed.',
  duplicate: 'A record with these details already exists. Review the values and try again.',
  invalidJson: 'We could not read the submitted data. Refresh the page and try again.',
  serverError: 'Something went wrong on our side. Try again.',
} as const;

export function permissionDenied(action: string): string {
  return `Your account does not have permission to ${action}. Contact an administrator if you need access.`;
}
