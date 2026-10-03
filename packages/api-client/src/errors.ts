import { ApiError } from './client'

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
