type JsonRecord = Record<string, unknown>

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred'

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object'
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function extractErrorFromPayloadWithSource(payload: unknown): {
  message?: string
  code?: string
  source?: string
} {
  if (!isRecord(payload)) return {}

  const topError = asNonEmptyString(payload.error)
  if (topError) {
    return { message: topError, code: topError, source: 'payload.error' }
  }

  const topMessage = asNonEmptyString(payload.message)
  if (topMessage) {
    return { message: topMessage, source: 'payload.message' }
  }

  const topTitle = asNonEmptyString(payload.title)
  if (topTitle) {
    return { message: topTitle, source: 'payload.title' }
  }

  const nestedData = payload.data
  if (!isRecord(nestedData)) return {}

  const nestedError = asNonEmptyString(nestedData.error)
  if (nestedError) {
    return {
      message: nestedError,
      code: nestedError,
      source: 'payload.data.error',
    }
  }

  const nestedMessage = asNonEmptyString(nestedData.message)
  if (nestedMessage) {
    return { message: nestedMessage, source: 'payload.data.message' }
  }

  const nestedTitle = asNonEmptyString(nestedData.title)
  if (nestedTitle) {
    return { message: nestedTitle, source: 'payload.data.title' }
  }

  return {}
}

export function extractErrorMessageFromPayload(payload: unknown): {
  message?: string
  code?: string
} {
  const extracted = extractErrorFromPayloadWithSource(payload)
  return {
    ...(extracted.message ? { message: extracted.message } : {}),
    ...(extracted.code ? { code: extracted.code } : {}),
  }
}

export function extractStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined

  const response = error.response
  if (isRecord(response)) {
    const responseStatus = toFiniteNumber(response.status)
    if (responseStatus !== undefined) {
      return responseStatus
    }
  }

  const directStatus = toFiniteNumber(error.status)
  if (directStatus !== undefined) {
    return directStatus
  }

  return undefined
}

export interface NormalizedError {
  message: string
  status?: number
  code?: string
  source: string
}

export function normalizeError(
  error: unknown,
  fallback: string = DEFAULT_ERROR_MESSAGE
): NormalizedError {
  if (typeof error === 'string') {
    const direct = asNonEmptyString(error)
    if (direct) {
      return { message: direct, source: 'string' }
    }
  }

  let status = extractStatus(error)
  let message: string | undefined
  let code: string | undefined
  let source = 'fallback'

  if (isRecord(error)) {
    const responsePayload = isRecord(error.response)
      ? (error.response as JsonRecord).data
      : undefined
    const dataPayload = error.data

    for (const payload of [responsePayload, dataPayload]) {
      if (payload === undefined) continue

      const extracted = extractErrorFromPayloadWithSource(payload)
      if (extracted.message && !message) {
        message = extracted.message
        code = extracted.code
        source = extracted.source ?? 'payload'
      }
    }

    // Conservative app-level envelope handling: only treat as error when
    // status is present and >= 400.
    const envelopePayload = responsePayload ?? dataPayload
    if (isRecord(envelopePayload)) {
      const envelopeStatus = toFiniteNumber(envelopePayload.status)
      const envelopeError = asNonEmptyString(envelopePayload.error)
      if (
        envelopeError &&
        envelopeStatus !== undefined &&
        envelopeStatus >= 400
      ) {
        message = envelopeError
        code = envelopeError
        source = 'payload.status-error-envelope'
        status = status ?? envelopeStatus
      }
    }

    if (!message) {
      const extracted = extractErrorFromPayloadWithSource(error)
      if (extracted.message) {
        message = extracted.message
        code = extracted.code
        source = extracted.source ?? 'error-object'
      }
    }
  }

  if (!message && error instanceof Error) {
    const errorMessage = asNonEmptyString(error.message)
    if (errorMessage) {
      message = errorMessage
      source = 'error.message'
    }
  }

  const fallbackMessage =
    asNonEmptyString(fallback) ?? DEFAULT_ERROR_MESSAGE

  return {
    message: message ?? fallbackMessage,
    ...(status !== undefined ? { status } : {}),
    ...(code ? { code } : {}),
    source: message ? source : 'fallback',
  }
}

