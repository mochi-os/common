import { cn } from '../../lib/utils'
import { normalizeError } from '../../lib/error-normalizer'
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
  const normalized = normalizeError(error)
  const statusCode = normalized.status ?? 500
  const message = normalized.message

  // Use the error message as the heading if it's descriptive
  const isDescriptiveMessage = message !== 'An unexpected error occurred' &&
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
