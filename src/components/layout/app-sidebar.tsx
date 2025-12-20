import { useLayout } from '../../context/layout-provider'
import {
  Sidebar,
  SidebarContent,
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
      <SidebarContent>
        {data.navGroups.map((props: NavGroupType) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
