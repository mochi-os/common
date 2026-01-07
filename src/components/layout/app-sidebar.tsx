import { useLayout } from '../../context/layout-provider'
import { useNotifications } from '../../hooks/use-notifications'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '../ui/sidebar'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { AppTitle } from './app-title'
import { NotificationsDropdown } from '../notifications-dropdown'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import type { SidebarData, NavGroup as NavGroupType } from './types'

type AppSidebarProps = {
  data: SidebarData
  showNotifications?: boolean
  sidebarFooter?: React.ReactNode
}

function CollapseBtn() {
  const { toggleSidebar, state } = useSidebar()
  return (
    <Button
      data-sidebar='trigger'
      variant='outline'
      size='icon'
      className={cn(
        'absolute -right-3 top-1/2 -translate-y-1/2 z-50 h-6 w-6 rounded-full border bg-background shadow-md',
        'hover:bg-accent hover:text-accent-foreground',
        'hidden md:inline-flex'
      )}
      onClick={() => toggleSidebar()}
    >
      {state === 'expanded' ? (
        <ChevronLeft className='h-3 w-3' />
      ) : (
        <ChevronRight className='h-3 w-3' />
      )}
      <span className='sr-only'>Toggle Sidebar</span>
    </Button>
  )
}

function SidebarNotificationButton({
  showNotifications,
}: {
  showNotifications: boolean
}) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const { state } = useSidebar()

  if (!showNotifications) return null

  return (
    <div
      className={cn(
        'flex items-center justify-center px-2',
        state === 'collapsed' ? 'mt-2' : ''
      )}
    >
      <NotificationsDropdown
        notifications={notifications}
        notificationsUrl='/notifications/'
        onNotificationClick={(n) => markAsRead(n.id)}
        onMarkAllAsRead={markAllAsRead}
        buttonClassName={cn(
          state === 'collapsed' ? 'h-8 w-8 p-0' : 'h-8 w-8 p-0'
        )}
      />
    </div>
  )
}

export function AppSidebar({
  data,
  showNotifications = true,
  sidebarFooter,
}: AppSidebarProps) {
  const { collapsible } = useLayout()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible={collapsible} variant='sidebar'>
      <SidebarHeader
        className={cn(
          'p-2',
          state === 'collapsed'
            ? 'flex-col items-center'
            : 'flex-row items-center justify-between'
        )}
      >
        <AppTitle title='mochi-os' subtitle='' />
        {state === 'expanded' && (
          <SidebarNotificationButton showNotifications={showNotifications} />
        )}
      </SidebarHeader>

      {state === 'collapsed' && (
        <SidebarNotificationButton showNotifications={showNotifications} />
      )}

      <SidebarContent>
        {data.navGroups.map((props: NavGroupType) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        {sidebarFooter}
        <NavUser />
      </SidebarFooter>

      <CollapseBtn />
    </Sidebar>
  )
}
