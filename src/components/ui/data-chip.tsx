import * as React from 'react'
import { cn } from '../../lib/utils'
import { CopyButton } from './copy-button'

interface DataChipProps {
  value: string
  label?: string
  icon?: React.ReactNode
  copyable?: boolean
  className?: string
  chipClassName?: string
}

export function DataChip({
  value,
  label,
  icon,
  copyable = true,
  className,
  chipClassName,
}: DataChipProps) {
  return (
    <div className={cn('flex items-center gap-1.5 overflow-hidden group/chip', className)}>
      <div
        className={cn(
          'bg-muted/50 text-foreground/80 font-mono text-[13px] px-2 py-0.5 rounded-md border truncate flex items-center gap-1.5 transition-colors group-hover/chip:bg-muted group-hover/chip:text-foreground',
          chipClassName
        )}
      >
        {icon}
        {label && <span className='text-muted-foreground/60 font-sans font-normal'>{label}:</span>}
        <span>{value}</span>
      </div>
      {copyable && (
        <div className="opacity-0 group-hover/chip:opacity-100 transition-opacity">
          <CopyButton value={value} />
        </div>
      )}
    </div>
  )
}
