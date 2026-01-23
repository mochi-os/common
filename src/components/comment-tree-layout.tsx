import type { ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'

// Grid config - these match the proven Feeds design
const COL_WIDTH = 'w-5' // 20px
const AVATAR_SIZE = 'size-5' // 20px
const LINE_LEFT = 'left-[9px]' // Center of 20px
const CURVE_WIDTH = 'w-3' // 12px


export interface CommentTreeLayoutProps {
  /** Nesting depth (0 = top-level) */
  depth?: number
  /** Whether this is the last child in its parent's list */
  isLastChild?: boolean
  /** Whether the node is collapsed */
  isCollapsed: boolean
  /** Toggle collapse state */
  onToggleCollapse: () => void
  /** Whether the node has children */
  hasChildren: boolean
  /** The avatar element to display */
  avatar: ReactNode
  /** The main content (author, body, actions, etc.) */
  content: ReactNode
  /** The nested child nodes (only rendered when not collapsed) */
  children?: ReactNode
  /** Collapsed summary content (shown when collapsed) */
  collapsedContent?: ReactNode
}

export function CommentTreeLayout({
  depth = 0,
  isLastChild = true,
  isCollapsed,
  onToggleCollapse,
  hasChildren,
  avatar,
  content,
  children,
  collapsedContent,
}: CommentTreeLayoutProps) {
  // Rainbow palette - Solid colors to match the "previous design" reference
  const RAINBOW_COLORS = [
    'bg-rose-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-sky-400',
    'bg-violet-400',
  ]

  const RAINBOW_BORDERS = [
    'border-rose-400',
    'border-amber-400',
    'border-emerald-400',
    'border-sky-400',
    'border-violet-400',
  ]

  // Color logic:
  // - The "Bend" (vertical line + curve) belongs conceptually to the PARENT's trunk extension.
  //   So it should use the color of (depth - 1).
  // - The "Trunk" (dropping down from this avatar) starts the NEXT level.
  //   So it should use the color of (depth).

  // Color for the line coming from above (parent's level)
  const parentColorBg = RAINBOW_COLORS[(depth - 1) % RAINBOW_COLORS.length]
  const parentColorBorder = RAINBOW_BORDERS[(depth - 1) % RAINBOW_BORDERS.length]

  // Color for the line dropping down from this comment (current level)
  const selfColorBg = RAINBOW_COLORS[depth % RAINBOW_COLORS.length]
  // Used for the border of the expand/collapse button
  const selfColorBorder = RAINBOW_BORDERS[depth % RAINBOW_BORDERS.length]

  return (
    <div className='flex'>
      {/* 1. Bend Column (Only for Depth > 0) */}
      {depth > 0 && (
        <div className={`relative ${COL_WIDTH} shrink-0`}>
          {/* Vertical line for siblings (extends full height if not last child) */}
          {!isLastChild && (
            <div
              className={`${parentColorBg} absolute top-0 bottom-0 ${LINE_LEFT} w-[2px]`}
            />
          )}
          {/* Curved bend connector for THIS comment */}
          {/* Vertical part of the bend (top half) */}
          <div
            className={`${parentColorBg} absolute top-0 ${LINE_LEFT} h-3 w-[2px]`}
          />
          {/* Horizontal curve part */}
          <div
            className={`${parentColorBorder} absolute top-3 ${LINE_LEFT} h-3 ${CURVE_WIDTH} rounded-bl-xl border-b-[2px] border-l-[2px] border-t-0 border-r-0`}
          />
        </div>
      )}

      {/* 2. Main Block (Avatar + Content + Replies) */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Row: Avatar + Content */}
        <div className='flex gap-2 pb-2'>
          {/* Avatar Column */}
          <div
            className={`relative ${COL_WIDTH} flex shrink-0 flex-col items-center`}
          >
            <div
              className={`flex ${AVATAR_SIZE} z-[5] shrink-0 items-center justify-center`}
            >
              {avatar}
            </div>
            {/* Collapse/Expand Button */}
            {hasChildren && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleCollapse()
                }}
                className={`bg-background hover:bg-muted text-muted-foreground z-[5] mt-1 flex size-3 items-center justify-center rounded-sm border transition-colors ${selfColorBorder}`}
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? (
                  <Plus className='size-2' />
                ) : (
                  <Minus className='size-2' />
                )}
              </button>
            )}

            {/* Trunk Line (Down to children) - extends past pb-2 padding */}
            {hasChildren && !isCollapsed && (
              <div
                className={`${selfColorBg} absolute top-4 -bottom-2 ${LINE_LEFT} w-[2px]`}
              />
            )}
          </div>

          {/* Content */}
          <div className='min-w-0 flex-1'>
            {isCollapsed ? collapsedContent : content}
          </div>
        </div>

        {/* Replies Block - Nested */}
        {hasChildren && !isCollapsed && (
          <div className='w-full'>{children}</div>
        )}
      </div>
    </div>
  )
}
