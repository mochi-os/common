import * as React from 'react'
import { PanelTop, Rows } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

export type ViewMode = 'card' | 'compact'

interface ViewOption {
  value: ViewMode
  label: string
  icon: React.ElementType
}

const VIEW_OPTIONS: ViewOption[] = [
  { value: 'card', label: 'Card', icon: PanelTop },
  { value: 'compact', label: 'Compact', icon: Rows },
]

interface ViewSelectorProps {
  value: ViewMode
  onValueChange: (value: ViewMode) => void
  disabled?: boolean
  className?: string
}

export function ViewSelector({
  value,
  onValueChange,
  disabled,
  className,
}: ViewSelectorProps) {
  const currentOption = VIEW_OPTIONS.find((opt) => opt.value === value)
  const Icon = currentOption?.icon

  return (
    <Select
      value={value}
      onValueChange={(v: string) => onValueChange(v as ViewMode)}
      disabled={disabled}
    >
      <SelectTrigger className={className} size="sm">
        <SelectValue>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4" />}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[140px]">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          View
        </div>
        {VIEW_OPTIONS.map((option) => {
          const OptionIcon = option.icon
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <OptionIcon className="size-4" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
