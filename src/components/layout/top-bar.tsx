import { useEffect, useState } from 'react'
import { CircleUser, LogIn, LogOut, Search, Grid3X3, Moon, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'
import { isDomainEntityRouting } from '../../lib/app-path'
import { useAuthStore } from '../../stores/auth-store'
import { readProfileCookie } from '../../lib/profile-cookie'
import { useTheme } from '../../context/theme-provider'
import useDialogState from '../../hooks/use-dialog-state'
import { useNotifications } from '../../hooks/use-notifications'
import { useScreenSize } from '../../hooks/use-screen-size'
import { SidebarTrigger } from '../ui/sidebar'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
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
import { NotificationsDropdown } from '../notifications-dropdown'

type TopBarProps = {
  showNotifications?: boolean
  showSidebarTrigger?: boolean
  showSearch?: boolean
  showAppSwitcher?: boolean
  vertical?: boolean
  className?: string
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

// App Switcher for global navigation between apps
function AppSwitcher({ buttonClassName }: { buttonClassName?: string }) {
  const apps = [
    { name: 'Home', url: '/', icon: '🏠' },
    { name: 'Chat', url: '/chat/', icon: '💬' },
    { name: 'Feeds', url: '/feeds/', icon: '📰' },
    { name: 'Forums', url: '/forums/', icon: '💭' },
    { name: 'Friends', url: '/friends/', icon: '👥' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={buttonClassName}>
          <Grid3X3 className="size-5" />
          <span className="sr-only">Apps</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>Apps</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {apps.map((app) => (
          <DropdownMenuItem key={app.name} asChild>
            <a href={app.url} className="flex items-center gap-2">
              <span>{app.icon}</span>
              {app.name}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Theme toggle component
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className="flex items-center justify-between px-2 py-1.5 text-sm">
      <div className="flex items-center gap-2">
        <Moon className="size-4" />
        Dark mode
      </div>
      <Switch checked={isDark} onCheckedChange={toggleTheme} />
    </div>
  )
}

export function TopBar({
  showNotifications = true,
  showSidebarTrigger = false,
  showSearch = false,
  showAppSwitcher = false,
  vertical = false,
  className,
}: TopBarProps) {
  const [open, setOpen] = useDialogState()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { isMobile, isDesktop } = useScreenSize()
  const isDark = theme === 'dark'
  // Only use vertical mode when explicitly requested
  const isVertical = vertical

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

  // Button sizes
  const iconButtonClass = 'size-9'

  // Non-logged-in: minimal header with just Mochi icon
  if (!isLoggedIn) {
    const isDomainRouted = isDomainEntityRouting()
    return (
      <header className={cn("z-50 flex h-12 items-center px-4", className)}>
        {isDomainRouted ? (
          // Domain-routed: just the icon, no dropdown
          <div className="flex items-center gap-2">
            <img
              src="./images/logo-header.svg"
              alt="Mochi"
              className="h-6 w-6"
            />
            <span className="text-lg font-semibold">Mochi</span>
          </div>
        ) : (
          // Main site: icon with dropdown containing login
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-3">
                <img
                  src="./images/logo-header.svg"
                  alt="Mochi"
                  className="h-6 w-6"
                />
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

  // Logged-in: full header spanning the viewport width
  return (
    <>
      <header
        className={cn(
          'z-50 flex h-full w-full items-center gap-2 px-2',
          isVertical ? 'flex-col py-2' : 'flex-row',
          className
        )}
      >
        {/* Left section: Sidebar trigger + Logo + Mochi text */}
        <div className={cn('flex items-center gap-2', isVertical && 'flex-col')}>
          {/* Sidebar trigger (mobile/when requested) */}
          {showSidebarTrigger && <SidebarTrigger className={cn(iconButtonClass, 'md:hidden')} />}

          {/* Logo + Mochi branding */}
          <a
            href="/"
            className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
          >
            <img
              src="./images/logo-header.svg"
              alt="Mochi"
              className="h-6 w-6"
            />
            <span className="text-lg font-semibold">Mochi</span>
          </a>
        </div>

        {/* Spacer - pushes actions to the right */}
        <div className="flex-1" />

        {/* Right section: Global actions */}
        <div className={cn('flex items-center gap-1', isVertical && 'flex-col')}>
          {/* Search */}
          {showSearch && (
            <Button
              variant='ghost'
              size={isDesktop ? 'default' : 'icon'}
              className={cn(
                'gap-2',
                !isDesktop && iconButtonClass,
                isDesktop && 'text-muted-foreground font-normal'
              )}
            >
              <Search className='size-5' />
              {isDesktop ? (
                <span>Search</span>
              ) : (
                <span className='sr-only'>Search</span>
              )}
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && <TopBarNotifications buttonClassName={iconButtonClass} />}

          {/* App Switcher */}
          {showAppSwitcher && <AppSwitcher buttonClassName={iconButtonClass} />}

          {/* User Menu with Name Display */}
          {isDesktop ? (
            <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("h-9 gap-2", isMobile ? "px-2" : "px-3")}>
                  <CircleUser className="size-5" />
                  {!isMobile && <span className="text-sm font-medium">{displayName}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-56" align="end">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="grid px-2 py-1.5 text-start text-sm leading-tight">
                    <span className="font-semibold">{displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      {displayEmail}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/settings/" className="flex items-center gap-2">
                    <Settings className="size-4" />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ThemeToggle />
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setOpen(true)}
                  className="hover:text-red-600 dark:hover:text-red-500 focus:text-red-600 dark:focus:text-red-500"
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Drawer open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <CircleUser className="size-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="sr-only">Profile</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  <div className="mb-4 pb-4 border-b">
                    <div className="grid text-start text-sm leading-tight">
                      <span className="truncate font-semibold">{displayName}</span>
                      <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a href="/settings/" className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md">
                      <Settings size={16} />
                      Settings
                    </a>
                    
                    <div className="flex items-center justify-between px-2 py-1.5 text-sm hover:bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <Moon className="size-4" />
                        Dark mode
                      </div>
                      <Switch 
                        checked={isDark} 
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                      />
                    </div>
                    
                    <button
                      onClick={() => setOpen(true)}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </header>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
