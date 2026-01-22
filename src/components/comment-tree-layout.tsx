import type { ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'

// Grid config - these match the proven Feeds design
const COL_WIDTH = 'w-5' // 20px
const AVATAR_SIZE = 'size-5' // 20px
const LINE_LEFT = 'left-[9px]' // Center of 20px
const CURVE_WIDTH = 'w-3' // 12px
const LINE_COLOR = 'bg-foreground/35' // Darker vertical lines
const BEND_COLOR = 'border-foreground/35' // Matching bend color

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
  return (
    <div className='flex'>
      {/* 1. Bend Column (Only for Depth > 0) */}
      {depth > 0 && (
        <div className={`relative ${COL_WIDTH} shrink-0`}>
          {/* Vertical line for siblings (extends full height if not last child) */}
          {!isLastChild && (
            <div
              className={`${LINE_COLOR} absolute top-0 bottom-0 ${LINE_LEFT} w-px`}
            />
          )}
          {/* Curved bend connector for THIS comment */}
          <div
            className={`${BEND_COLOR} absolute top-0 ${LINE_LEFT} h-3 ${CURVE_WIDTH} rounded-bl-md border-b border-l`}
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
                className='bg-background hover:bg-muted text-muted-foreground border-foreground/35 z-[5] mt-1 flex size-3 items-center justify-center rounded-sm border transition-colors'
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
                className={`${LINE_COLOR} absolute top-4 -bottom-2 ${LINE_LEFT} w-px`}
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
