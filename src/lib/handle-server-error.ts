import { AxiosError } from 'axios'
import { toast } from './toast-utils'
import { ApiError } from './request'

// Extract error message from various error types
export function getErrorMessage(error: unknown, fallback?: string): string {
  // Handle ApiError (from lib/common request helpers)
  if (error instanceof ApiError) {
    return error.message
  }

  // Handle AxiosError
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (data?.error) return data.error
    if (data?.message) return data.message
    if (data?.title) return data.title
    if (error.message) return error.message
  }

  // Handle standard Error
  if (error instanceof Error && error.message) {
    return error.message
  }

  // Handle object with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message
    if (typeof msg === 'string') return msg
  }

  return fallback ?? 'Something went wrong'
}

export function handleServerError(error: unknown) {
  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Content not found.'
  }

  if (error instanceof AxiosError) {
    errMsg = error.response?.data?.error || error.response?.data?.title || errMsg
  }

  toast.error(errMsg)
}
