import { ApiResponseError, ApiResponseSuccess } from '@/shared/types/response';
import { NextResponse } from 'next/server';
import { USER_MESSAGES } from '@/shared/messages/user-messages';

type ErrorDetails = Record<string, unknown> | undefined;

export const apiResponse = {
  ok<T>(data: T, status = 200): NextResponse<ApiResponseSuccess<T>> {
    return NextResponse.json({ ok: true, data }, { status });
  },

  success(status = 200): NextResponse<ApiResponseSuccess<undefined>> {
    return NextResponse.json({ ok: true, data: undefined }, { status });
  },

  error(message: string, status = 400, details?: ErrorDetails): NextResponse<ApiResponseError> {
    return NextResponse.json(
      {
        ok: false,
        message,
        ...(details ? { details } : {}),
      },
      { status },
    );
  },

  badRequest(message: string, details?: ErrorDetails) {
    return this.error(message, 400, details);
  },

  unauthorized(message: string = USER_MESSAGES.sessionRequired) {
    return this.error(message, 401);
  },

  forbidden(message: string = 'Your account does not have permission for this action.') {
    return this.error(message, 403);
  },

  notFound(message: string = USER_MESSAGES.notFound) {
    return this.error(message, 404);
  },

  conflict(
    message: string = 'This change conflicts with existing data. Refresh the page and try again.',
  ) {
    return this.error(message, 409);
  },

  internal(message: string = USER_MESSAGES.serverError) {
    return this.error(message, 500);
  },
};
