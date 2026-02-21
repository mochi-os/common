import { cn } from '../../lib/utils'
import { ApiError } from '../../lib/request'
import { Button } from '../../components/ui/button'
import { RotateCcw } from 'lucide-react'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
  error?: unknown
  reset?: () => void
  mode?: 'fullscreen' | 'inline'
}

export function GeneralError({
  className,
  minimal = false,
  error,
  reset,
  mode = 'fullscreen',
}: GeneralErrorProps) {

  // Extract error details directly from the error object
  let statusCode = 500
  let message = 'Unknown error'

  if (error instanceof ApiError) {
    statusCode = error.status || 500
    // Show the actual error message from the backend
    const errorData = error.data as { error?: string } | undefined
    message = errorData?.error || error.message || 'Unknown error'
  } else if (error instanceof Error) {
    // Check if error has ApiError-like properties (class might not survive serialization)
    const anyError = error as { status?: number; data?: { error?: string } }
    if (anyError.status) {
      statusCode = anyError.status
    }
    if (anyError.data?.error) {
      message = anyError.data.error
    } else {
      message = error.message || 'Unknown error'
    }
  } else if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    // Handle plain objects with error info
    const objError = error as { error?: string; message?: string; status?: number }
    if (objError.status) {
      statusCode = objError.status
    }
    message = objError.error || objError.message || 'Unknown error'
  }

  // Use the error message as the heading if it's descriptive
  const isDescriptiveMessage = message !== 'Unknown error' &&
    !message.includes('status code') &&
    !message.includes('Request failed')
  const heading = isDescriptiveMessage ? message : statusCode.toString()
  const showHeading = !minimal
  const showMessage = minimal || !isDescriptiveMessage

  return (
    <div
      className={cn(
        mode === 'fullscreen' ? 'h-svh w-full' : 'w-full',
        className
      )}
    >
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2',
          mode === 'fullscreen' && 'm-auto h-full'
        )}
      >
        {showHeading && (
          <h1 className='text-4xl leading-tight font-bold text-center'>{heading}</h1>
        )}
        {showMessage && (
          <p className='text-muted-foreground text-center'>
            {message}
          </p>
        )}
        {reset && (
          <Button
            type='button'
            onClick={reset}
            variant='outline'
            size='sm'
            className='mt-2'
          >
            <RotateCcw className='h-4 w-4' />
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}
