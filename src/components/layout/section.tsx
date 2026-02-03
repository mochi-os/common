import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { cn } from '../../lib/utils'

interface SectionProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  contentClassName?: string
  action?: React.ReactNode
}

export function Section({
  title,
  description,
  children,
  className,
  contentClassName,
  action,
}: SectionProps) {
  const hasContent = children !== undefined && children !== null && children !== false && !(Array.isArray(children) && children.length === 0)
  const isContentHidden = contentClassName?.includes('hidden')
  const showContent = hasContent && !isContentHidden

  return (
    <Card className={cn('shadow-md', className)}>
      <CardHeader className={cn('flex flex-row items-start justify-between space-y-0', showContent ? 'border-b/60 border-b pb-4' : 'pb-4')}>
        <div className="space-y-1.5">
          <CardTitle className="text-lg leading-tight">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      {showContent && (
        <CardContent className={cn('py-2', contentClassName)}>
          {children}
        </CardContent>
      )}
    </Card>
  )
}

interface FieldRowProps {
  label: string
  children: React.ReactNode
  className?: string
  description?: string
}

export function FieldRow({ label, children, className, description }: FieldRowProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-2 sm:gap-4 py-4 border-b border-border/40 last:border-0', className)}>
      <div className="sm:pt-1.5">
        <dt className="text-muted-foreground text-sm font-medium leading-none sm:leading-tight">
          {label}
        </dt>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground/60 leading-normal">
            {description}
          </p>
        )}
      </div>
      <dd className="flex items-center gap-2 overflow-hidden py-0.5">
        {children}
      </dd>
    </div>
  )
}
