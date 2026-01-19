import { useState } from 'react'
import { useLayout } from '../../context/layout-provider'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Home,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/auth-store'
import { readProfileCookie } from '../../lib/profile-cookie'
import { useNotifications } from '../../hooks/use-notifications'
import type { Notification } from '../notifications-dropdown'
import useDialogState from '../../hooks/use-dialog-state'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar'
import { NavGroup } from './nav-group'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { SignOutDialog } from '../sign-out-dialog'
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

function formatTimestamp(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`

  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Mochi logo with optional notification badge
function MochiLogo({ unreadCount }: { unreadCount?: number }) {
  const hasNotifications = unreadCount !== undefined && unreadCount > 0
  return (
    <div className="relative">
      <img
        src="./images/logo-header.svg"
        alt="Mochi"
        className="h-6 w-6"
      />
      {hasNotifications && (
        <span className='absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm animate-pulsate'>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  )
}

// Notification item for the menu
function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification
  onClick?: (notification: Notification) => void
}) {
  const isUnread = notification.read === 0

  return (
    <button
      type="button"
      onClick={() => onClick?.(notification)}
      className={cn(
        'flex w-full items-start gap-2 px-2 py-2 text-left text-sm rounded-md transition-colors hover:bg-muted',
        isUnread ? 'bg-muted/50' : ''
      )}
    >
      <div
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          isUnread ? 'bg-primary' : 'bg-transparent'
        )}
      />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug truncate', isUnread && 'font-medium')}>
          {notification.content}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatTimestamp(notification.created)}
        </p>
      </div>
    </button>
  )
}

// Notifications section for the menu
function NotificationsSection({
  onClose,
}: {
  onClose: () => void
}) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const [expanded, setExpanded] = useState(false)
  const unreadNotifications = notifications.filter((n) => n.read === 0)
  const unreadCount = unreadNotifications.length

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.link) {
      onClose()
      window.location.href = notification.link
    }
  }

  if (unreadCount === 0) {
    return (
      <div className="px-2 py-3 text-center">
        <p className="text-sm text-muted-foreground">No new notifications</p>
      </div>
    )
  }

  const displayedNotifications = expanded
    ? unreadNotifications
    : unreadNotifications.slice(0, 3)

  return (
    <div className="py-1">
      <div className="px-2 pb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Notifications
        </span>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => markAllAsRead()}
              title="Clear all"
            >
              <Check className="size-4" />
            </button>
          )}
          <a
            href="/notifications/"
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="View all"
            target="_self"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
      <ScrollArea className={expanded ? 'max-h-64' : ''}>
        <div className="space-y-0.5 px-1">
          {displayedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      </ScrollArea>
      {unreadCount > 3 && !expanded && (
        <div className="flex justify-center pt-1">
          <button
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setExpanded(true)}
            title={`Show ${unreadCount - 3} more`}
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// Mochi logo menu for the sidebar header
function SidebarLogoMenu({ showNotifications }: { showNotifications?: boolean }) {
  const [signOutOpen, setSignOutOpen] = useDialogState()
  const [menuOpen, setMenuOpen] = useState(false)
  const { notifications } = useNotifications()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const email = useAuthStore((state) => state.email)
  const profile = readProfileCookie()
  const displayName = profile.name || 'User'
  const displayEmail = email || ''

  const unreadCount = notifications.filter((n) => n.read === 0).length

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <div
            className={cn(
              'flex items-center group/logo',
              isCollapsed ? 'flex-col gap-4 py-2' : 'gap-1'
            )}
          >
            {/* Logo - opens menu */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    'w-auto hover:bg-transparent active:bg-transparent focus-visible:ring-0',
                    isCollapsed && 'size-auto p-0 hover:bg-transparent'
                  )}
                >
                  <MochiLogo unreadCount={showNotifications ? unreadCount : 0} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-72" align="start">
                {/* User info with logout icon */}
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="grid text-start text-sm leading-tight">
                      <span className="font-semibold">{displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {displayEmail}
                      </span>
                    </div>
                    <button
                      onClick={() => setSignOutOpen(true)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Log out"
                    >
                      <LogOut className="size-4" />
                    </button>
                  </div>
                </DropdownMenuLabel>

                {/* Notifications */}
                {showNotifications && (
                  <>
                    <DropdownMenuSeparator />
                    <NotificationsSection onClose={() => setMenuOpen(false)} />
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Home - hidden until hover, hidden when at "/" */}
            {window.location.pathname !== '/' && (
              <a
                href="/"
                className={cn(
                  'rounded transition-all text-muted-foreground hover:text-foreground',
                  isCollapsed
                    ? 'p-0 hover:bg-transparent opacity-100 flex items-center justify-center'
                    : 'ml-1 p-1 hover:bg-muted opacity-0 group-hover/logo:opacity-100'
                )}
                title="Home"
              >
                <Home className="size-5" />
              </a>
            )}
          </div>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  )
}

export function AppSidebar({
  data,
  showNotifications = true,
  sidebarFooter,
}: AppSidebarProps) {
  const { collapsible } = useLayout()

  return (
    <Sidebar collapsible={collapsible} variant='sidebar'>
      {/* Header with Mochi logo menu */}
      <SidebarHeader>
        <SidebarLogoMenu showNotifications={showNotifications} />
      </SidebarHeader>

      {/* Scrollable navigation content */}
      <SidebarContent className='overflow-y-auto'>
        {data.navGroups.map((props: NavGroupType) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      {/* Optional footer content from props */}
      {sidebarFooter && <SidebarFooter>{sidebarFooter}</SidebarFooter>}

      <CollapseBtn />
    </Sidebar>
  )
}
