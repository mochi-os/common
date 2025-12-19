import * as React from 'react'
import { cn } from '../../lib/utils'

function NotificationBadge({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="notification-badge"
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-notification text-notification-foreground text-[10px] font-medium',
        className
      )}
      {...props}
    />
  )
}

export { NotificationBadge }
