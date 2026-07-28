import { NotFoundError } from '@/shared/http/http-error';

/** Maps domain not-found errors and invalid MongoDB ids to a route-level 404. */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof NotFoundError || (error as { name?: string })?.name === 'CastError';
}
