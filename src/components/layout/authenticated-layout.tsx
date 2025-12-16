import { Outlet } from '@tanstack/react-router'
import { cn } from '../../lib/utils'
import { getCookie } from '../../lib/cookies'
import { LayoutProvider } from '../../context/layout-provider'
import { SearchProvider } from '../../context/search-provider'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { TopBar } from './top-bar'
import { AppSidebar } from './app-sidebar'
import type { SidebarData } from './types'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
  title: string
  sidebarData?: SidebarData
  showNotifications?: boolean
}

export function AuthenticatedLayout({
  children,
  title,
  sidebarData,
  showNotifications = true,
}: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const hasSidebar = sidebarData && sidebarData.navGroups.length > 0

  return (
    <SearchProvider>
      <LayoutProvider>
        <div className="flex h-svh flex-col">
          <TopBar title={title} showNotifications={showNotifications} />
          {hasSidebar ? (
            <SidebarProvider defaultOpen={defaultOpen} className="flex-1 overflow-hidden">
              <AppSidebar data={sidebarData} />
              <SidebarInset
                className={cn(
                  '@container/content',
                  'overflow-auto'
                )}
              >
                {children ?? <Outlet />}
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <div className={cn('@container/content', 'flex-1 overflow-auto')}>
              {children ?? <Outlet />}
            </div>
          )}
        </div>
      </LayoutProvider>
    </SearchProvider>
  )
}
