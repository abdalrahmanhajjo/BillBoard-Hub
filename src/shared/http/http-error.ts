import { USER_MESSAGES } from '@/shared/messages/user-messages';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = 'Check the submitted details and try again.') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = USER_MESSAGES.sessionRequired) {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Your account does not have permission for this action.') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = USER_MESSAGES.notFound) {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(
    message: string = 'This change conflicts with existing data. Refresh and try again.',
  ) {
    super(409, message);
    this.name = 'ConflictError';
  }
}
