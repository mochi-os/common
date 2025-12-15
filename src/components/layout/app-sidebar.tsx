import { useLayout } from '../../context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from '../ui/sidebar'
import { NavGroup } from './nav-group'
import type { SidebarData, NavGroup as NavGroupType } from './types'

type AppSidebarProps = {
  data: SidebarData
}

export function AppSidebar({ data }: AppSidebarProps) {
  const { collapsible, variant } = useLayout()
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarContent className="pt-6">
        {data.navGroups.map((props: NavGroupType) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
