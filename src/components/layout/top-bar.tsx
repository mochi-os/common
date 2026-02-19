import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  CircleUser,
  ExternalLink,
  LogIn,
  LogOut,
  PanelLeft,
  Settings,

} from 'lucide-react'

import { cn } from '../../lib/utils'
import { isDomainEntityRouting } from '../../lib/app-path'
import { useAuthStore } from '../../stores/auth-store'
import { useTheme } from '../../context/theme-provider'
import useDialogState from '../../hooks/use-dialog-state'
import { useNotifications } from '../../hooks/use-notifications'
import type { Notification } from '../notifications-dropdown'
import { useScreenSize } from '../../hooks/use-screen-size'
import { useSidebar } from '../ui/sidebar'
import { Button } from '../ui/button'
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
  vertical?: boolean
  className?: string
}

/* -----------------------------------------------------
 * Helpers
 * --------------------------------------------------- */
function formatTimestamp(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`

  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

/* -----------------------------------------------------
 * Mochi Logo
 * --------------------------------------------------- */
function MochiLogo() {
  return (
    <div className='pt-2'>
      <img src='/images/logo-header.svg' alt='Mochi' className='h-6 w-6' />
    </div>
  )
}

/* -----------------------------------------------------
 * User Icon
 * --------------------------------------------------- */
function UserIcon({ unreadCount }: { unreadCount?: number }) {
  return (
    <div className='relative pt-2 pr-2'>
      <CircleUser className='size-6 text-muted-foreground' />
      {!!unreadCount && (
        <span className='absolute right-0 top-0 z-10 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white'>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  )
}

/* -----------------------------------------------------
 * Notifications
 * --------------------------------------------------- */
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
      type='button'
      onClick={() => onClick?.(notification)}
      className={cn(
        'flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-interactive-hover active:bg-interactive-active',
        isUnread && 'bg-muted/50'
      )}
    >
      <div
        className={cn('mt-1.5 size-2 rounded-full', isUnread && 'bg-primary')}
      />
      <div className='flex-1 min-w-0'>
        <p className={cn('truncate', isUnread && 'font-medium')}>
          {notification.content}
        </p>
        <p className='text-[11px] text-muted-foreground'>
          {formatTimestamp(notification.created)}
        </p>
      </div>
    </button>
  )
}

function NotificationsSection({ onClose }: { onClose: () => void }) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const [expanded, setExpanded] = useState(false)

  const unread = notifications.filter((n) => n.read === 0)
  const visible = expanded ? unread : unread.slice(0, 3)

  return (
    <div className='py-1'>
      <div className='flex items-center justify-between px-2 pb-1'>
        <span className='text-xs font-medium text-muted-foreground'>
          Notifications
        </span>
        <div className='flex gap-1'>
          {unread.length > 0 && (
            <button
              onClick={markAllAsRead}
              className='rounded p-1 hover:bg-interactive-hover active:bg-interactive-active'
            >
              <Check className='size-4' />
            </button>
          )}
          <a
            href='/notifications/'
            onClick={onClose}
            className='rounded p-1 hover:bg-interactive-hover active:bg-interactive-active'
          >
            <ExternalLink className='size-4' />
          </a>
        </div>
      </div>

      {unread.length === 0 ? (
        <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
          All caught up
        </div>
      ) : (
        <>
          <ScrollArea className={expanded ? 'max-h-64' : ''}>
            <div className='space-y-0.5 px-1'>
              {visible.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onClick={(notif) => {
                    markAsRead(notif.id)
                    notif.link && (window.location.href = notif.link)
                  }}
                />
              ))}
            </div>
          </ScrollArea>

          {unread.length > 3 && !expanded && (
            <div className='flex justify-center pt-1'>
              <button onClick={() => setExpanded(true)}>
                <ChevronDown className='size-4' />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* -----------------------------------------------------
 * TopBar
 * --------------------------------------------------- */
export function TopBar({
  showNotifications = true,
  showSidebarTrigger = false,
  vertical = false,
  className,
}: TopBarProps) {
  const [signOutOpen, setSignOutOpen] = useDialogState()
  const [menuOpen, setMenuOpen] = useState(false)

  const { theme } = useTheme()
  const { isMobile } = useScreenSize()
  const { toggleSidebar } = useSidebar()
  const { notifications } = useNotifications()

  const name = useAuthStore((s) => s.name)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoggedIn = isAuthenticated

  const unreadCount = notifications.filter((n) => n.read === 0).length

  useEffect(() => {
    const meta = document.querySelector("meta[name='theme-color']")
    meta?.setAttribute('content', theme === 'dark' ? '#020817' : '#fff')
  }, [theme])

  /* ------------------ NOT LOGGED IN ------------------ */
  if (!isLoggedIn) {
    const isDomainRouted = isDomainEntityRouting()

    return (
      <header className={cn('z-50 flex h-12 items-center px-4', className)}>
        {isDomainRouted ? (
          <MochiLogo />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='gap-2'>
                <MochiLogo />
                <span className='font-semibold'>Mochi</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuItem asChild>
                <a href='/login'>
                  <LogIn className='size-4' />
                  Log in
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
    )
  }

  /* ------------------ MENU CONTENT ------------------ */
  const menuContent = (
    <>
      <DropdownMenuLabel className='p-0 font-normal'>
        <div className='flex items-center justify-between px-2 py-1.5'>
          <div className='grid text-sm'>
            <span className='font-semibold'>{name || 'User'}</span>
          </div>
          <div className='flex items-center gap-1'>
            <a
              href='/settings'
              className='flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-interactive-hover active:bg-interactive-active'
            >
              <Settings className='size-4' />
            </a>
            <button
              onClick={() => setSignOutOpen(true)}
              className='text-destructive flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-destructive/15 active:bg-destructive/20'
            >
              <LogOut className='size-4' />
            </button>
          </div>
        </div>
      </DropdownMenuLabel>

      {showNotifications && (
        <>
          <DropdownMenuSeparator />
          <NotificationsSection onClose={() => setMenuOpen(false)} />
        </>
      )}
    </>
  )

  return (
    <>
      <header
        className={cn(
          'z-50 flex items-center gap-2 px-2 py-4 overflow-visible',
          vertical && 'flex-col',
          className
        )}
      >
        {/* Sidebar toggle (mobile) */}
        {showSidebarTrigger && isMobile && (
          <button
            onClick={toggleSidebar}
            className='rounded p-1 hover:bg-interactive-hover active:bg-interactive-active'
          >
            <PanelLeft className='size-5 text-muted-foreground' />
          </button>
        )}

        <div className='flex items-center gap-2 overflow-visible'>
          {/* Home */}
          <a href='/' title='Home'>
            <MochiLogo />
          </a>

          {/* User menu */}
          {isMobile ? (
            <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
              <DrawerTrigger asChild>
                <button className='rounded p-1 hover:bg-interactive-hover active:bg-interactive-active'>
                  <UserIcon unreadCount={showNotifications ? unreadCount : 0} />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className='sr-only'>Menu</DrawerTitle>
                </DrawerHeader>
                <div className='px-4 pb-4'>{menuContent}</div>
              </DrawerContent>
            </Drawer>
          ) : (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className='rounded p-1 hover:bg-interactive-hover active:bg-interactive-active'>
                  <UserIcon unreadCount={showNotifications ? unreadCount : 0} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='min-w-72'>
                {menuContent}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {!vertical && <div className='flex-1' />}
      </header>

      <SignOutDialog open={!!signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  )
}
