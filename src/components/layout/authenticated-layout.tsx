import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { cn } from '../../lib/utils'
import { getCookie } from '../../lib/cookies'
import { isDomainEntityRouting } from '../../lib/app-path'
import { useAuthStore } from '../../stores/auth-store'
import { LayoutProvider } from '../../context/layout-provider'
import { SearchProvider } from '../../context/search-provider'
import { SidebarInset, SidebarProvider, useSidebar } from '../ui/sidebar'
import { TopBar } from './top-bar'
import { AppSidebar } from './app-sidebar'
import type { SidebarData } from './types'

// Full-height rail that covers both TopBar and Sidebar
function FullHeightRail() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <button
      type="button"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'absolute inset-y-0 -right-2 z-20 hidden w-4 sm:block',
        'after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:-translate-x-1/2',
        'after:bg-sidebar-border hover:after:bg-sidebar-foreground/30',
        state === 'collapsed' ? 'cursor-e-resize' : 'cursor-w-resize'
      )}
    />
  )
}

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
  sidebarData?: SidebarData
  showNotifications?: boolean
  title?: string
}

export function AuthenticatedLayout({
  children,
  sidebarData,
  showNotifications = true,
  title,
}: AuthenticatedLayoutProps) {
  useEffect(() => {
    if (title) {
      document.title = title
    }
  }, [title])

  const email = useAuthStore((state) => state.email)
  const isLoggedIn = !!email
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const hasSidebar = sidebarData && sidebarData.navGroups.length > 0

  // Anonymous users: minimal layout
  if (!isLoggedIn) {
    const isDomainRouted = isDomainEntityRouting()
    return (
      <SearchProvider>
        <LayoutProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <div className="relative h-svh w-full">
              {/* Floating TopBar - only on main site, not domain-routed entities */}
              {!isDomainRouted && (
                <div className="absolute top-0 left-0 z-50">
                  <TopBar showNotifications={false} />
                </div>
              )}
              {/* Content fills the entire viewport */}
              <div className={cn('@container/content', 'h-full overflow-auto')}>
                {children ?? <Outlet />}
              </div>
            </div>
          </SidebarProvider>
        </LayoutProvider>
      </SearchProvider>
    )
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <div className="flex h-svh w-full flex-col md:flex-row">
            {hasSidebar ? (
              <>
                {/* Mobile header bar */}
                <div className="flex h-12 flex-shrink-0 items-center border-b px-2 md:hidden">
                  <TopBar showNotifications={showNotifications} showSidebarTrigger />
                </div>

                {/* Left column: TopBar + Sidebar (desktop only) */}
                <div
                  className={cn(
                    'relative hidden h-full flex-col flex-shrink-0 overflow-visible md:flex',
                    'w-(--sidebar-width) has-data-[state=collapsed]:w-(--sidebar-width-icon)',
                    'transition-[width] duration-200 ease-linear'
                  )}
                >
                  <TopBar showNotifications={showNotifications} />
                  <AppSidebar data={sidebarData} />
                  <FullHeightRail />
                </div>

                {/* Content area */}
                <SidebarInset className={cn('@container/content', 'overflow-auto flex-1')}>
                  {children ?? <Outlet />}
                </SidebarInset>
              </>
            ) : (
              <>
                {/* Minimal TopBar for apps without sidebar */}
                <div className="flex flex-col flex-shrink-0">
                  <TopBar showNotifications={showNotifications} vertical />
                </div>

                {/* Content area fills the rest */}
                <div className={cn('@container/content', 'flex-1 overflow-auto')}>
                  {children ?? <Outlet />}
                </div>
              </>
            )}
          </div>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
