import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      <Icon className='text-muted-foreground mx-auto mb-3 h-10 w-10 opacity-50' />
      <p className='text-muted-foreground mb-1 text-sm font-medium'>{title}</p>
      {description && (
        <p className='text-muted-foreground text-xs'>{description}</p>
      )}
      {children && <div className='mt-4 flex justify-center gap-2'>{children}</div>}
    </div>
  )
}
