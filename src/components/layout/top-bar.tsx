import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  ExternalLink,
  Home,
  LogIn,
  LogOut,
  PanelLeft,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { isDomainEntityRouting } from '../../lib/app-path'
import { useAuthStore } from '../../stores/auth-store'
import { readProfileCookie } from '../../lib/profile-cookie'
import { useTheme } from '../../context/theme-provider'
import useDialogState from '../../hooks/use-dialog-state'
import { useNotifications } from '../../hooks/use-notifications'
import type { Notification } from '../notifications-dropdown'
import { useScreenSize } from '../../hooks/use-screen-size'
import { useSidebar } from '../ui/sidebar'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { ScrollArea } from '../ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'
import { SignOutDialog } from '../sign-out-dialog'

type TopBarProps = {
  showNotifications?: boolean
  showSidebarTrigger?: boolean
  showSearch?: boolean
  showAppSwitcher?: boolean
  vertical?: boolean
  className?: string
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
function MochiLogo({ hasNotifications }: { hasNotifications?: boolean }) {
  return (
    <div className="relative">
      <img
        src="./images/logo-header.svg"
        alt="Mochi"
        className="h-6 w-6"
      />
      {hasNotifications && (
        <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex size-2.5 rounded-full bg-red-500"></span>
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

// Sidebar toggle for the menu
function SidebarToggleItem() {
  const { toggleSidebar, open } = useSidebar()

  return (
    <div
      className="flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-muted cursor-pointer"
      onClick={toggleSidebar}
    >
      <div className="flex items-center gap-2">
        <PanelLeft className="size-4" />
        Sidebar
      </div>
      <Switch checked={open} onCheckedChange={toggleSidebar} />
    </div>
  )
}

export function TopBar({
  showNotifications = true,
  showSidebarTrigger = false,
  vertical = false,
  className,
}: TopBarProps) {
  const [signOutOpen, setSignOutOpen] = useDialogState()
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme } = useTheme()
  const { isDesktop, isMobile } = useScreenSize()
  const { notifications } = useNotifications()
  const { toggleSidebar } = useSidebar()

  const email = useAuthStore((state) => state.email)
  const isLoggedIn = !!email
  const profile = readProfileCookie()
  const displayName = profile.name || 'User'
  const displayEmail = email || ''

  const unreadCount = notifications.filter((n) => n.read === 0).length
  const hasNotifications = showNotifications && unreadCount > 0

  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  // Non-logged-in: minimal header with just Mochi icon
  if (!isLoggedIn) {
    const isDomainRouted = isDomainEntityRouting()
    return (
      <header className={cn('z-50 flex h-12 items-center px-4', className)}>
        {isDomainRouted ? (
          <div className="flex items-center gap-2">
            <MochiLogo />
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-3">
                <MochiLogo />
                <span className="text-lg font-semibold">Mochi</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/login">
                  <LogIn className="size-4" />
                  Log in
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
    )
  }

  // Logged-in: Mochi logo as the single menu trigger
  const menuContent = (
    <>
      {/* User info with logout icon */}
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="grid text-start text-sm leading-tight">
            <span className="font-semibold">{displayName}</span>
            <span className="text-xs text-muted-foreground">{displayEmail}</span>
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

      {/* Sidebar toggle (mobile only) */}
      {showSidebarTrigger && isMobile && (
        <>
          <DropdownMenuSeparator />
          <SidebarToggleItem />
        </>
      )}

      {/* Notifications */}
      {showNotifications && (
        <>
          <DropdownMenuSeparator />
          <NotificationsSection onClose={() => setMenuOpen(false)} />
        </>
      )}
    </>
  )

  // Mobile: use drawer
  const mobileMenuContent = (
    <div className="px-4 pb-4">
      {/* User info with logout icon */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="grid text-start text-sm leading-tight">
            <span className="truncate font-semibold">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
          </div>
          <button
            onClick={() => setSignOutOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Menu items */}
      {showSidebarTrigger && (
        <div className="flex flex-col gap-1">
          <SidebarToggleItem />
        </div>
      )}

      {/* Notifications */}
      {showNotifications && (
        <div className="mt-4 pt-4 border-t">
          <NotificationsSection onClose={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  )

  return (
    <>
      <header
        className={cn(
          'z-50 flex items-center',
          !vertical && 'mt-2',
          vertical
            ? 'h-auto flex-col gap-1 pl-4 pr-2 pt-7 pb-2'
            : 'h-full w-full flex-row gap-2 px-2',
          className
        )}
      >
        {/* Logo opens menu, other icons appear on hover */}
        {isDesktop ? (
          <div className="group/logo flex items-center gap-1">
            {/* Logo - opens menu */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center focus:outline-none">
                  <MochiLogo hasNotifications={hasNotifications} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-72" align="start">
                {menuContent}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Home - hidden until hover, hidden when at "/" */}
            {window.location.pathname !== '/' && (
              <a
                href="/"
                className={cn(
                  "-ml-1 p-1 rounded hover:bg-muted transition-all",
                  "opacity-0 group-hover/logo:opacity-100"
                )}
                title="Home"
              >
                <Home className="size-5 text-muted-foreground" />
              </a>
            )}
          </div>
        ) : (
          <div className="group/logo flex items-center gap-1">
            {/* Logo - opens drawer */}
            <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
              <DrawerTrigger asChild>
                <button className="flex items-center focus:outline-none">
                  <MochiLogo hasNotifications={hasNotifications} />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="sr-only">Menu</DrawerTitle>
                </DrawerHeader>
                {mobileMenuContent}
              </DrawerContent>
            </Drawer>

            {/* Home - hidden until hover, hidden when at "/" */}
            {window.location.pathname !== '/' && (
              <a
                href="/"
                className={cn(
                  "-ml-1 p-1 rounded hover:bg-muted transition-all",
                  "opacity-0 group-hover/logo:opacity-100"
                )}
                title="Home"
              >
                <Home className="size-5 text-muted-foreground" />
              </a>
            )}

            {/* Sidebar toggle - mobile only, hidden until hover */}
            {showSidebarTrigger && (
              <button
                onClick={() => toggleSidebar()}
                className={cn(
                  "-ml-1 p-1 rounded hover:bg-muted transition-all",
                  "opacity-0 group-hover/logo:opacity-100"
                )}
                title="Toggle sidebar"
              >
                <PanelLeft className="size-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Spacer - only for horizontal layout */}
        {!vertical && <div className="flex-1" />}
      </header>

      <SignOutDialog open={!!signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  )
}
