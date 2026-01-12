import { useEffect } from 'react'
import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Sun,
  Check,
  Monitor,
  CircleUser,
  Settings,
} from 'lucide-react'
import { useAuthStore } from '../../stores/auth-store'
import { readProfileCookie } from '../../lib/profile-cookie'
import { cn } from '../../lib/utils'
import { useTheme } from '../../context/theme-provider'
import { useScreenSize } from '../../hooks/use-screen-size'
import useDialogState from '../../hooks/use-dialog-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar'
import { SignOutDialog } from '../sign-out-dialog'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { isDesktop } = useScreenSize()
  const [open, setOpen] = useDialogState()
  const [dropdownOpen, setDropdownOpen] = useDialogState()
  const { theme, setTheme } = useTheme()

  // Use email from auth store (Template mirrors core auth cookie shape)
  const email = useAuthStore((state) => state.email)
  // Get name from mochi_me cookie
  const profile = readProfileCookie()
  const displayName = profile.name || 'User'
  const displayEmail = email || ''

  /* Update theme-color meta tag when theme is updated */
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  const triggerButton = (
    <SidebarMenuButton
      size='lg'
      className='data-[state=open]:bg-hover data-[state=open]:text-hover-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2'
    >
      <CircleUser className='hidden size-4 group-data-[collapsible=icon]:block' />
      <div className='grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden'>
        <span className='truncate font-semibold'>{displayName}</span>
        <span className='truncate text-xs'>{displayEmail}</span>
      </div>
      <ChevronsUpDown className='ms-auto size-4 group-data-[collapsible=icon]:hidden' />
    </SidebarMenuButton>
  )

  const menuContent = (
    <>
      <DropdownMenuLabel className='p-0 font-normal'>
        <div className='grid px-2 py-1.5 text-start text-sm leading-tight'>
          <span className='truncate font-semibold'>{displayName}</span>
          <span className='truncate text-xs text-muted-foreground'>{displayEmail}</span>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <a href='/settings/' className='flex items-center gap-2'>
          <Settings size={16} />
          Settings
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Sun /> Theme
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun />
            Light
            <Check
              size={14}
              className={cn('ms-auto', theme !== 'light' && 'hidden')}
            />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon />
            Dark
            <Check
              size={14}
              className={cn('ms-auto', theme !== 'dark' && 'hidden')}
            />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Monitor />
            System
            <Check
              size={14}
              className={cn('ms-auto', theme !== 'system' && 'hidden')}
            />
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => setOpen(true)}
        variant='destructive'
        className='hover:bg-destructive/10 hover:text-destructive [&_svg]:hover:text-destructive'
      >
        <LogOut />
        Log out
      </DropdownMenuItem>
    </>
  )

  if (isDesktop) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu open={!!dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side={isMobile ? 'bottom' : 'right'}
                align='end'
                sideOffset={4}
              >
                {menuContent}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <SignOutDialog open={!!open} onOpenChange={setOpen} />
      </>
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <Drawer open={!!dropdownOpen} onOpenChange={setDropdownOpen}>
            <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className='sr-only'>Profile</DrawerTitle>
              </DrawerHeader>
              <div className='px-4 pb-4'>
                <div className='mb-4 pb-4 border-b'>
                  <div className='grid text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{displayName}</span>
                    <span className='truncate text-xs text-muted-foreground'>{displayEmail}</span>
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <a href='/settings/' className='flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md'>
                    <Settings size={16} />
                    Settings
                  </a>
                  <div className='px-2 py-1.5'>
                    <div className='text-sm font-medium mb-2'>Theme</div>
                    <div className='flex flex-col gap-1'>
                      <button
                        onClick={() => setTheme('light')}
                        className='flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md'
                      >
                        <Sun size={16} />
                        Light
                        <Check
                          size={14}
                          className={cn('ms-auto', theme !== 'light' && 'hidden')}
                        />
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className='flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md'
                      >
                        <Moon size={16} />
                        Dark
                        <Check
                          size={14}
                          className={cn('ms-auto', theme !== 'dark' && 'hidden')}
                        />
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className='flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md'
                      >
                        <Monitor size={16} />
                        System
                        <Check
                          size={14}
                          className={cn('ms-auto', theme !== 'system' && 'hidden')}
                        />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(true)}
                    className='flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md'
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </SidebarMenuItem>
      </SidebarMenu>
      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}

export function NavUserDropdownContent() {
  const [open, setOpen] = useDialogState()
  const { theme, setTheme } = useTheme()

  const email = useAuthStore((state) => state.email)
  const profile = readProfileCookie()
  const displayName = profile.name || 'User'
  const displayEmail = email || ''

  return (
    <>
      <DropdownMenuLabel className='p-0 font-normal'>
        <div className='grid px-2 py-1.5 text-start text-sm leading-tight'>
          <span className='truncate font-semibold'>{displayName}</span>
          <span className='truncate text-xs text-muted-foreground'>{displayEmail}</span>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <a href='/settings/' className='flex items-center gap-2'>
          <Settings size={16} />
          Settings
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Sun /> Theme
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun />
            Light
            <Check
              size={14}
              className={cn('ms-auto', theme !== 'light' && 'hidden')}
            />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon />
            Dark
            <Check
              size={14}
              className={cn('ms-auto', theme !== 'dark' && 'hidden')}
            />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Monitor />
            System
            <Check
              size={14}
              className={cn('ms-auto', theme !== 'system' && 'hidden')}
            />
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => setOpen(true)}
        variant='destructive'
        className='hover:bg-destructive/10 hover:text-destructive [&_svg]:hover:text-destructive'
      >
        <LogOut />
        Log out
      </DropdownMenuItem>
      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
