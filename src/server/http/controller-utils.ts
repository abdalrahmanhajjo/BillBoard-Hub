import { AuthError } from "next-auth";
import { apiResponse } from "@/server/http/api-response";
import {
  HttpError,
  NotFoundError,
} from "@/shared/http/http-error";

export function validationMessage(
  issues: Array<{ message?: string }> | undefined,
  fallbackMessage: string,
): string {
  return issues?.[0]?.message ?? fallbackMessage;
}

export function handleControllerError(error: unknown, message: string) {
  if (error instanceof AuthError) {
    return apiResponse.unauthorized("Invalid email or password.");
  }

  if (error instanceof NotFoundError) {
    return apiResponse.notFound(error.message);
  }

  // Catch invalid MongoDB ObjectId format
  if (
    error &&
    (error as { name?: string; message?: string }).name === "CastError"
  ) {
    return apiResponse.notFound("Not found.");
  }

  if (error instanceof HttpError) {
    console.error("HttpError:", error.message, "Status:", error.status);
    return apiResponse.error(error.message, error.status);
  }

  if (error instanceof Error) {
    console.error("Error:", error.message);
    return apiResponse.error(error.message, 400);
  }

  return apiResponse.error(message, 400);
}
