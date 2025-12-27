import { useEffect } from 'react'
import { CircleUser, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/auth-store'
import { readProfileCookie } from '../../lib/profile-cookie'
import { useTheme } from '../../context/theme-provider'
import useDialogState from '../../hooks/use-dialog-state'
import { useNotifications } from '../../hooks/use-notifications'
import { useSidebar } from '../ui/sidebar'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { SignOutDialog } from '../sign-out-dialog'
import { NotificationsDropdown } from '../notifications-dropdown'

type TopBarProps = {
  showNotifications?: boolean
  vertical?: boolean
}

// Separate component to isolate the useNotifications hook
function TopBarNotifications({ buttonClassName }: { buttonClassName?: string }) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()

  return (
    <NotificationsDropdown
      notifications={notifications}
      notificationsUrl="/notifications/"
      onNotificationClick={(n) => markAsRead(n.id)}
      onMarkAllAsRead={markAllAsRead}
      buttonClassName={buttonClassName}
    />
  )
}

export function TopBar({ showNotifications = true, vertical = false }: TopBarProps) {
  const [open, setOpen] = useDialogState()
  const { theme } = useTheme()
  const { state } = useSidebar()
  const isVertical = vertical || state === 'collapsed'

  const email = useAuthStore((state) => state.email)
  const isLoggedIn = !!email
  const profile = readProfileCookie()
  const displayName = profile.name || 'User'
  const displayEmail = email || ''

  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  // Use size-8 to match sidebar icons when collapsed, size-9 when expanded
  const iconButtonClass = isVertical ? 'size-8' : 'size-9'

  return (
    <>
      <header
        className={cn(
          'z-50 flex items-center',
          !vertical && 'mt-2',
          isVertical
            ? 'h-auto flex-col gap-1 px-2 py-2'
            : 'h-12 flex-row gap-1 px-2'
        )}
      >
        {/* Logo - sized to match sidebar menu buttons */}
        <a
          href="/"
          className={cn(
            'flex items-center justify-center rounded-md',
            isVertical ? 'size-8' : 'size-9'
          )}
        >
          <img
            src="./images/logo-header.svg"
            alt="Mochi"
            className="h-6 w-6"
          />
        </a>

        {/* User Menu */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={iconButtonClass}>
                <CircleUser className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56" align="start">
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="grid px-2 py-1.5 text-start text-sm leading-tight">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {displayEmail}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" className={iconButtonClass} asChild>
            <a href="/login">
              <CircleUser className="size-5" />
            </a>
          </Button>
        )}

        {/* Notifications */}
        {showNotifications && <TopBarNotifications buttonClassName={iconButtonClass} />}
      </header>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
