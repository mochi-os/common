import { useLayout } from '../../context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '../ui/sidebar'
import { NavGroup } from './nav-group'
import type { SidebarData, NavGroup as NavGroupType } from './types'

type AppSidebarProps = {
  data: SidebarData
  showNotifications?: boolean
  sidebarFooter?: React.ReactNode
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
      <SidebarContent className='overflow-y-auto pt-2'>
        {data.navGroups.map((props: NavGroupType) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      {/* Optional footer content from props */}
      {sidebarFooter && <SidebarFooter>{sidebarFooter}</SidebarFooter>}
    </Sidebar>
  )
}
