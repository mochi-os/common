import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { cn } from '../../lib/utils'
import { getCookie } from '../../lib/cookies'
import { isDomainEntityRouting } from '../../lib/app-path'
import { useAuthStore } from '../../stores/auth-store'
import { LayoutProvider } from '../../context/layout-provider'
import { SearchProvider } from '../../context/search-provider'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { TopBar } from './top-bar'
import { AppSidebar } from './app-sidebar'
import {
  RightPanel,
  RightPanelProvider,
  RightPanelHeader,
  RightPanelContent,
  RightPanelFooter,
  RightPanelCloseButton,
} from './right-panel'
import type { SidebarData } from './types'

// Removed FullHeightRail component - no longer needed without collapse button

type RightPanelConfig = {
  header?: React.ReactNode
  content?: React.ReactNode
  footer?: React.ReactNode
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
  showCloseButton?: boolean
}

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
  sidebarData?: SidebarData
  sidebarFooter?: React.ReactNode
  showNotifications?: boolean
  title?: string
  mobileTitle?: React.ReactNode
  /** Configuration for the optional right panel */
  rightPanel?: RightPanelConfig
  /** Default open state for the right panel */
  rightPanelDefaultOpen?: boolean
}

export function AuthenticatedLayout({
  children,
  sidebarData,
  showNotifications = true,
  title,
  mobileTitle: _mobileTitle,
  sidebarFooter,
  rightPanel,
  rightPanelDefaultOpen = true,
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
  const hasRightPanel =
    rightPanel && (rightPanel.header || rightPanel.content || rightPanel.footer)

  // Anonymous users: minimal layout
  if (!isLoggedIn) {
    const isDomainRouted = isDomainEntityRouting()
    return (
      <SearchProvider>
        <LayoutProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <div className='relative h-svh w-full'>
              {/* Floating TopBar - only on main site, not domain-routed entities */}
              {!isDomainRouted && (
                <div className='absolute top-0 left-0 z-50'>
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

  // Main authenticated layout content
  const layoutContent = (
    <div className='flex h-full w-full flex-col'>
      {/* Fixed Header - spans full width on all screen sizes */}
      <header className='fixed top-0 left-0 right-0 z-[60] h-12 flex-shrink-0 border-b bg-background'>
        <div className='flex h-full items-center px-2'>
          <TopBar
            showNotifications={showNotifications}
            showSidebarTrigger={hasSidebar}
          />
        </div>
      </header>

      {/* Main body below fixed header */}
      <div className='flex flex-1 pt-12'>
        {hasSidebar ? (
          <>
            {/* Left Sidebar - hidden on mobile, shown as drawer via SidebarTrigger */}
            <div
              className={cn(
                'relative hidden h-[calc(100vh-3rem)] flex-col flex-shrink-0 overflow-visible md:flex',
                'w-(--sidebar-width) has-data-[state=collapsed]:w-(--sidebar-width-icon)',
                'transition-[width] duration-200 ease-linear'
              )}
            >
              <AppSidebar
                data={sidebarData}
                showNotifications={showNotifications}
                sidebarFooter={sidebarFooter}
              />
            </div>

            {/* Main Content Area - independently scrollable */}
            <SidebarInset
              className={cn(
                '@container/content',
                'h-[calc(100vh-3rem)] overflow-auto flex-1'
              )}
            >
              {children ?? <Outlet />}
            </SidebarInset>

            {/* Right Panel - optional, only on large screens */}
            {hasRightPanel && (
              <RightPanel className='h-[calc(100vh-3rem)]'>
                {(rightPanel.header || rightPanel.showCloseButton) && (
                  <RightPanelHeader className={rightPanel.headerClassName}>
                    <div className='flex-1'>{rightPanel.header}</div>
                    {rightPanel.showCloseButton && <RightPanelCloseButton />}
                  </RightPanelHeader>
                )}
                {rightPanel.content && (
                  <RightPanelContent className={rightPanel.contentClassName}>
                    {rightPanel.content}
                  </RightPanelContent>
                )}
                {rightPanel.footer && (
                  <RightPanelFooter className={rightPanel.footerClassName}>
                    {rightPanel.footer}
                  </RightPanelFooter>
                )}
              </RightPanel>
            )}
          </>
        ) : (
          /* Content area fills the rest when no sidebar */
          <div
            className={cn(
              '@container/content',
              'h-[calc(100vh-3rem)] flex-1 overflow-auto'
            )}
          >
            {children ?? <Outlet />}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          {hasRightPanel ? (
            <RightPanelProvider defaultOpen={rightPanelDefaultOpen}>
              {layoutContent}
            </RightPanelProvider>
          ) : (
            layoutContent
          )}
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
