import {
  isAxiosError,
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import apiClient from './api-client'

const devConsole = globalThis.console

export interface ApiErrorParams {
  message: string
  status?: number
  data?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  readonly status?: number
  readonly data?: unknown
  readonly cause?: unknown

  constructor({ message, status, data, cause }: ApiErrorParams) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

const buildApiError = (
  error: unknown,
  fallbackMessage: string,
  requestConfig: AxiosRequestConfig
): ApiError => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>
    const status = axiosError.response?.status
    const responseData = axiosError.response?.data
    // Backend may return either {"message": "..."} or {"error": "..."}
    const message =
      responseData?.error ??
      responseData?.message ??
      axiosError.message ??
      `${requestConfig.method ?? 'request'} ${requestConfig.url} failed`

    return new ApiError({
      message,
      status,
      data: responseData,
      cause: error,
    })
  }

  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message || fallbackMessage,
      cause: error,
    })
  }

  return new ApiError({ message: fallbackMessage, data: error })
}

const logRequestError = (
  error: ApiError,
  requestConfig: AxiosRequestConfig
): void => {
  if (!import.meta.env.DEV) {
    return
  }

  const method = requestConfig.method?.toUpperCase() ?? 'REQUEST'
  const url = requestConfig.url ?? '<unknown>'
  devConsole?.error?.(
    `[API] ${method} ${url} failed`,
    error.cause ?? error.data ?? error.message
  )
}

// Raw request that returns the full response without unwrapping the data envelope
export async function requestRaw<TResponse>(
  config: AxiosRequestConfig
): Promise<TResponse> {
  const requestConfig: AxiosRequestConfig = {
    ...config,
  }

  try {
    const response: AxiosResponse<TResponse> =
      await apiClient.request<TResponse>(requestConfig)
    return response.data
  } catch (unknownError) {
    const apiError = buildApiError(
      unknownError,
      'Unexpected API error',
      requestConfig
    )
    logRequestError(apiError, requestConfig)
    throw apiError
  }
}

export async function request<TResponse>(
  config: AxiosRequestConfig
): Promise<TResponse> {
  const requestConfig: AxiosRequestConfig = {
    ...config,
  }

  try {
    const response: AxiosResponse<TResponse> =
      await apiClient.request<TResponse>(requestConfig)

    // Unwrap the data envelope if present
    // Backend returns {"data": {...}} format
    const responseData = response.data as unknown
    let unwrappedData = responseData

    if (
      responseData &&
      typeof responseData === 'object' &&
      'data' in responseData
    ) {
      unwrappedData = (responseData as { data: unknown }).data
    }

    // Check for application-level errors in successful HTTP responses
    // Some backends return HTTP 200 with error details in the response body
    // Only throw if status >= 400; responses like {error: "not_found"} without
    // a status are valid data responses, not errors
    if (
      unwrappedData &&
      typeof unwrappedData === 'object' &&
      'error' in unwrappedData &&
      'status' in unwrappedData
    ) {
      const errorData = unwrappedData as { error?: string; status?: number }
      // Throw if there's an error field with a status >= 400
      if (errorData.error && errorData.status && errorData.status >= 400) {
        // Throw an error for application-level errors
        const apiError = new ApiError({
          message: errorData.error,
          status: errorData.status,
          data: unwrappedData,
        })
        logRequestError(apiError, requestConfig)
        throw apiError
      }
    }

    return unwrappedData as TResponse
  } catch (unknownError) {
    const apiError = buildApiError(
      unknownError,
      'Unexpected API error',
      requestConfig
    )
    logRequestError(apiError, requestConfig)
    throw apiError
  }
}

export const requestHelpers = {
  get: <TResponse>(
    url: string,
    config?: Omit<AxiosRequestConfig, 'url' | 'method'>
  ): Promise<TResponse> =>
    request<TResponse>({
      method: 'GET',
      url,
      ...config,
    }),
  getRaw: <TResponse>(
    url: string,
    config?: Omit<AxiosRequestConfig, 'url' | 'method'>
  ): Promise<TResponse> =>
    requestRaw<TResponse>({
      method: 'GET',
      url,
      ...config,
    }),
  post: <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: Omit<AxiosRequestConfig<TBody>, 'url' | 'method' | 'data'>
  ): Promise<TResponse> =>
    request<TResponse>({
      method: 'POST',
      url,
      data,
      ...config,
    }),
  put: <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: Omit<AxiosRequestConfig<TBody>, 'url' | 'method' | 'data'>
  ): Promise<TResponse> =>
    request<TResponse>({
      method: 'PUT',
      url,
      data,
      ...config,
    }),
  patch: <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: Omit<AxiosRequestConfig<TBody>, 'url' | 'method' | 'data'>
  ): Promise<TResponse> =>
    request<TResponse>({
      method: 'PATCH',
      url,
      data,
      ...config,
    }),
  delete: <TResponse>(
    url: string,
    config?: Omit<AxiosRequestConfig, 'url' | 'method'>
  ): Promise<TResponse> =>
    request<TResponse>({
      method: 'DELETE',
      url,
      ...config,
    }),
}

export default request
