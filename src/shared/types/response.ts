export type ApiResponseSuccess<T> = {
  ok: true;
  data?: T;
};

export type ApiResponseError = {
  ok: false;
  message?: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;
