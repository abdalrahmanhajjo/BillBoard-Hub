import { NextResponse } from "next/server";

type ErrorDetails = Record<string, unknown> | undefined;

export const apiResponse = {
  ok<T>(data: T, status = 200) {
    return NextResponse.json({ ok: true, data }, { status });
  },

  success(status = 200) {
    return NextResponse.json({ ok: true }, { status });
  },

  error(message: string, status = 400, details?: ErrorDetails) {
    return NextResponse.json(
      {
        ok: false,
        error: message,
        ...(details ? { details } : {}),
      },
      { status },
    );
  },

  badRequest(message: string, details?: ErrorDetails) {
    return this.error(message, 400, details);
  },

  unauthorized(message = "Not authenticated.") {
    return this.error(message, 401);
  },

  forbidden(message = "Forbidden.") {
    return this.error(message, 403);
  },

  notFound(message = "Resource not found.") {
    return this.error(message, 404);
  },

  conflict(message = "Conflict.") {
    return this.error(message, 409);
  },

  internal(message = "Unexpected server error.") {
    return this.error(message, 500);
  },
};
