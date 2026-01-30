import type { ReactNode } from 'react'
import { useScreenSize } from '../../hooks/use-screen-size'

interface PageHeaderProps {
  icon?: ReactNode
  title: ReactNode
  description?: string
  actions?: ReactNode
}

export function PageHeader({
  icon,
  title,
  description,
  actions,
}: PageHeaderProps) {
  const { isMobile } = useScreenSize()

  return (
    <header className='border-border bg-background sticky top-0 z-10 border-b'>
      {/* Title and actions row */}
      <div className='flex h-[52px] items-center justify-between px-4 md:h-[56px] md:px-6'>
        <div>
          <div className='flex items-center gap-2 md:gap-3'>
            {icon}
            <h1
              className={
                isMobile ? 'text-base font-semibold' : 'text-lg font-semibold'
              }
            >
              {title}
            </h1>
          </div>
          {description && (
            <p className='text-muted-foreground text-sm'>{description}</p>
          )}
        </div>
        {actions && <div className='flex items-center gap-2'>{actions}</div>}
      </div>
    </header>
  )
}
