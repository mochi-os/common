import { toast as sonnerToast, type ExternalToast } from 'sonner'

// Error toasts stay longer (10s vs default 6s)
const ERROR_DURATION = 10000

// Toast wrapper that adds copy functionality to error toasts
export const toast = {
  ...sonnerToast,

  // Override error to add copy action and longer duration
  error: (message: string | React.ReactNode, data?: ExternalToast) => {
    const description = data?.description
    const textToCopy =
      typeof message === 'string'
        ? description
          ? `${message}: ${description}`
          : message
        : description
          ? String(description)
          : ''

    return sonnerToast.error(message, {
      duration: ERROR_DURATION,
      ...data,
      action: textToCopy
        ? {
            label: '📋',
            onClick: () => {
              navigator.clipboard.writeText(textToCopy)
              sonnerToast.success('Copied')
            },
          }
        : undefined,
    })
  },
}
