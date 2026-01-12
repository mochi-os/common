import { useLayout } from '../../context/layout-provider'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '../ui/sidebar'
import { NavGroup } from './nav-group'
import { Button } from '../ui/button'
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

export function AppSidebar({
  data,
  showNotifications,
  sidebarFooter,
}: AppSidebarProps) {
  const { collapsible } = useLayout()

  // showNotifications prop is kept for API compatibility but notifications
  // are now shown in the fixed header TopBar component
  void showNotifications

  return (
    <Sidebar collapsible={collapsible} variant='sidebar'>
      {/* Empty header for spacing consistency */}
      <SidebarHeader className='p-0 h-0' />

      {/* Scrollable navigation content */}
      <SidebarContent className='overflow-y-auto pt-3'>
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
