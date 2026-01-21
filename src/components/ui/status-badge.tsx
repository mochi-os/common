import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

type StatusVariant = 'success' | 'info' | 'warning' | 'muted'

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-50 dark:bg-green-950/20',
  info: 'bg-blue-50 dark:bg-blue-950/20',
  warning: 'bg-amber-50 dark:bg-amber-950/20',
  muted: 'bg-muted/30',
}

const iconContainerStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 dark:bg-green-900/30',
  info: 'bg-blue-100 dark:bg-blue-900/30',
  warning: 'bg-amber-100 dark:bg-amber-900/30',
  muted: 'bg-muted',
}

const iconStyles: Record<StatusVariant, string> = {
  success: 'text-green-600 dark:text-green-500',
  info: 'text-blue-600 dark:text-blue-500',
  warning: 'text-amber-600 dark:text-amber-500',
  muted: 'text-muted-foreground',
}

const textStyles: Record<StatusVariant, string> = {
  success: 'text-green-900 dark:text-green-100',
  info: 'text-blue-900 dark:text-blue-100',
  warning: 'text-amber-900 dark:text-amber-100',
  muted: 'text-foreground',
}

interface StatusBadgeProps {
  icon: LucideIcon
  title: string
  description?: string
  variant?: StatusVariant
  bordered?: boolean
  className?: string
}

export function StatusBadge({
  icon: Icon,
  title,
  description,
  variant = 'muted',
  bordered = true,
  className,
}: StatusBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3',
        bordered && 'border',
        variantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          iconContainerStyles[variant]
        )}
      >
        <Icon className={cn('h-5 w-5', iconStyles[variant])} />
      </div>
      <div className='flex-1'>
        <p className={cn('text-sm font-medium', textStyles[variant])}>
          {title}
        </p>
        {description && (
          <p className='text-muted-foreground text-xs'>{description}</p>
        )}
      </div>
    </div>
  )
}
