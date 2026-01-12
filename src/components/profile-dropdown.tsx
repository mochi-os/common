import useDialogState from '../hooks/use-dialog-state'
import { useScreenSize } from '../hooks/use-screen-size'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { SignOutDialog } from './sign-out-dialog'

export function ProfileDropdown() {
  const { isDesktop } = useScreenSize()
  const [open, setOpen] = useDialogState()
  const [dropdownOpen, setDropdownOpen] = useDialogState()

  const avatarButton = (
    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
      <Avatar className='h-8 w-8'>
        <AvatarImage src='/avatars/01.png' alt='@shadcn' />
        <AvatarFallback>SN</AvatarFallback>
      </Avatar>
    </Button>
  )

  const userInfo = (
    <div className='flex flex-col gap-1.5'>
      <p className='text-sm leading-none font-medium'>satnaing</p>
      <p className='text-muted-foreground text-xs leading-none'>
        satnaingdev@gmail.com
      </p>
    </div>
  )

  const logoutButton = (
    <Button
      variant='ghost'
      className='w-full justify-start px-2 text-sm'
      onClick={() => setOpen(true)}
    >
      Log out
    </Button>
  )

  if (isDesktop) {
    return (
      <>
        <DropdownMenu modal={false} open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>{avatarButton}</DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              {userInfo}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setOpen(true)}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SignOutDialog open={!!open} onOpenChange={setOpen} />
      </>
    )
  }

  return (
    <>
      <Drawer open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DrawerTrigger asChild>{avatarButton}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className='sr-only'>Profile</DrawerTitle>
          </DrawerHeader>
          <div className='px-4 pb-4'>
            <div className='mb-4 pb-4 border-b'>{userInfo}</div>
            {logoutButton}
          </div>
        </DrawerContent>
      </Drawer>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
