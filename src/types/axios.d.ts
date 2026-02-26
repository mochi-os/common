import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    mochi?: {
      showGlobalErrorToast?: boolean
      toastDedupeKey?: string
      toastDedupeTtlMs?: number
    }
  }
}
