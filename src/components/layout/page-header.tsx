import type { ReactNode } from 'react'
import { useScreenSize } from '../../hooks/use-screen-size'

interface PageHeaderProps {
  icon?: ReactNode
  title: ReactNode
  description?: string
  actions?: ReactNode
  /** Optional search bar to show in full-width row above title on mobile */
  searchBar?: ReactNode
}

export function PageHeader({ icon, title, description, actions, searchBar }: PageHeaderProps) {
  const { isMobile } = useScreenSize()

  return (
    <header className='border-border bg-background sticky top-0 z-10 border-b'>
      {/* Search bar on mobile - full width row */}
      {isMobile && searchBar && (
        <div className='border-b px-4 py-2'>
          {searchBar}
        </div>
      )}
      
      {/* Title and actions row */}
      <div className='flex h-[52px] items-center justify-between px-4 md:h-[60px] md:px-6'>
          <div>
            <div className='flex items-center gap-2 md:gap-3'>
              {icon}
              <h1 className={isMobile ? 'text-base font-semibold' : 'text-lg font-semibold'}>
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
