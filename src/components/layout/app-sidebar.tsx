import { useState } from 'react'
import { useLayout } from '../../context/layout-provider'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  ExternalLink,
  LogOut,
  Settings,
  BellOff,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/auth-store'
import { useNotifications } from '../../hooks/use-notifications'
import type { Notification } from '../notifications-dropdown'
import useDialogState from '../../hooks/use-dialog-state'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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
import { Skeleton } from '../ui/skeleton'
import { EmptyState } from '../ui/empty-state'
import type { SidebarData } from './types'

type AppSidebarProps = {
  data: SidebarData
  showNotifications?: boolean
  sidebarFooter?: React.ReactNode
  isLoading?: boolean
}

/* -----------------------------------------------------
 * Collapse / Expand Button (ENABLED ON MOBILE)
 * --------------------------------------------------- */
function CollapseBtn() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <Button
      data-sidebar='trigger'
      variant='outline'
      size='icon'
      className={cn(
        'absolute -right-3 top-1/2 -translate-y-1/2 z-50',
        'h-6 w-6 rounded-full border bg-background shadow-md',
        'hover:bg-accent hover:text-accent-foreground',
        'inline-flex' // <-- mobile + desktop
      )}
      onClick={toggleSidebar}
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
 * Mochi Logo (HOME LINK)
 * --------------------------------------------------- */
function MochiLogo() {
  return (
    <div className=''>
      <img src='/images/logo-header.svg' alt='Mochi' className='h-6 w-6' />
    </div>
  )
}

/* -----------------------------------------------------
 * User Icon
 * --------------------------------------------------- */
function UserIcon({ unreadCount }: { unreadCount?: number }) {
  return (
    <div className='relative'>
      <CircleUser className='size-5 text-muted-foreground' />
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
        'flex w-full items-start gap-2 px-2 py-2 text-left text-sm rounded-md transition-colors hover:bg-muted',
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

  if (!unread.length) {
    return (
      <EmptyState
        icon={BellOff}
        title="You're all caught up!"
        description='No unread notifications'
        className='py-8 bg-transparent'
      />
    )
  }

  const visible = expanded ? unread : unread.slice(0, 3)

  return (
    <div className='py-1'>
      <div className='flex items-center justify-between px-2 pb-1'>
        <span className='text-xs font-medium text-muted-foreground'>
          Notifications
        </span>
        <div className='flex gap-1'>
          <button
            onClick={markAllAsRead}
            className='p-1 hover:bg-muted rounded'
          >
            <Check className='size-4' />
          </button>
          <a
            href='/notifications/'
            onClick={onClose}
            className='p-1 hover:bg-muted rounded'
          >
            <ExternalLink className='size-4' />
          </a>
        </div>
      </div>

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
    </div>
  )
}

/* -----------------------------------------------------
 * Sidebar Header (Logo + User Menu)
 * --------------------------------------------------- */
function SidebarLogoMenu({
  showNotifications,
}: {
  showNotifications?: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useDialogState()
  const { notifications } = useNotifications()
  const { state } = useSidebar()

  const unreadCount = notifications.filter((n) => n.read === 0).length
  const name = useAuthStore((s) => s.name)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <div
            className={cn(
              'flex items-center p-2',
              state === 'expanded' ? 'gap-1.5' : 'flex-col gap-0 justify-center'
            )}
          >
            {/* Home */}
            <a href='/' title='Home' className='p-1'>
              <MochiLogo />
            </a>

            {/* User */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='sm'
                  className='w-auto p-2 overflow-visible'
                >
                  <UserIcon unreadCount={showNotifications ? unreadCount : 0} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent className='min-w-72' align='start'>
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center justify-between gap-3 px-2 py-1.5'>
                    <div className='flex-1 min-w-0'>
                      <div className='font-semibold truncate'>
                        {name || 'User'}
                      </div>
                    </div>
                    <div className='flex items-center gap-1'>
                      <a
                        href='/settings'
                        className='flex items-center justify-center p-1.5 hover:bg-muted rounded-md transition-colors'
                      >
                        <Settings className='size-4' />
                      </a>
                      <button
                        onClick={() => setSignOutOpen(true)}
                        className='flex items-center justify-center p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-destructive'
                      >
                        <LogOut className='size-4 text-destructive' />
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  )
}

/* -----------------------------------------------------
 * App Sidebar
 * --------------------------------------------------- */
export function AppSidebar({
  data,
  showNotifications = true,
  sidebarFooter,
  isLoading,
}: AppSidebarProps) {
  const { collapsible } = useLayout()
  const { isMobile } = useSidebar()

  return (
    <Sidebar collapsible={collapsible} variant='sidebar'>
      {!isMobile && (
        <SidebarHeader>
          <SidebarLogoMenu showNotifications={showNotifications} />
        </SidebarHeader>
      )}

      <SidebarContent className='overflow-y-auto'>
        {isLoading ? (
          <div className='space-y-4 px-2 py-2'>
            <div className='space-y-2'>
              <div className='px-2 py-1.5'>
                <Skeleton className='h-4 w-20' />
              </div>
              <div className='space-y-1'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-2 px-2 py-1'>
                    <Skeleton className='size-4 rounded-sm' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='px-2 py-1.5'>
                <Skeleton className='h-4 w-16' />
              </div>
              <div className='space-y-1'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-2 px-2 py-1'>
                    <Skeleton className='size-4 rounded-sm' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Primary action */}
            {(() => {
              const primary = data.navGroups
                .flatMap((g) => g.items)
                .find((i) => i.variant === 'primary' && 'onClick' in i)

              if (!primary || !('onClick' in primary)) return null

              return (
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        variant='primary'
                        onClick={primary.onClick}
                      >
                        {primary.icon && <primary.icon className='size-5' />}
                        <span className='group-data-[collapsible=icon]:hidden'>
                          {primary.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              )
            })()}

            {data.navGroups.map((group) => (
              <NavGroup
                key={group.title}
                {...group}
                items={group.items.filter((i) => i.variant !== 'primary')}
              />
            ))}
          </>
        )}
      </SidebarContent>

      {sidebarFooter && <SidebarFooter>{sidebarFooter}</SidebarFooter>}

      <CollapseBtn />
    </Sidebar>
  )
}
