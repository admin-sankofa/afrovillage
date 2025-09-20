import { ApiError } from "./queryClient";

export function isUnauthorizedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

export function getUnauthorizedReason(error: unknown): string | undefined {
  if (isUnauthorizedError(error)) {
    return error.reason;
  }
  return undefined;
}
