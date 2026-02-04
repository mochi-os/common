import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Switch } from './switch'

export type ViewMode = 'card' | 'compact'

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
  const isCompact = value === 'compact'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={className}
        disabled={disabled}
        asChild
      >
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            onValueChange(isCompact ? 'card' : 'compact')
          }}
        >
          <div className="flex items-center justify-between w-full gap-4">
            <span>Compact view</span>
            <Switch
              checked={isCompact}
              onCheckedChange={(checked) => onValueChange(checked ? 'compact' : 'card')}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
