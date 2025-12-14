// UI Components
export * from './components/ui/alert-dialog'
export * from './components/ui/alert'
export * from './components/ui/avatar'
export * from './components/ui/badge'
export * from './components/ui/button'
export * from './components/ui/card'
export * from './components/ui/collapsible'
export * from './components/ui/command'
export * from './components/ui/dialog'
export * from './components/ui/drawer'
export * from './components/ui/dropdown-menu'
export * from './components/ui/form'
export * from './components/ui/input'
export * from './components/ui/label'
export * from './components/ui/popover'
export * from './components/ui/radio-group'
export * from './components/ui/responsive-dialog'
export * from './components/ui/scroll-area'
export * from './components/ui/select'
export * from './components/ui/separator'
export * from './components/ui/sheet'
export * from './components/ui/sidebar'
export * from './components/ui/skeleton'
export * from './components/ui/sonner'
export * from './components/ui/switch'
export * from './components/ui/table'
export * from './components/ui/textarea'
export * from './components/ui/tooltip'

// Layout Components
export * from './components/layout/main'
export * from './components/layout/header'
export * from './components/layout/top-bar'
export { NavGroup } from './components/layout/nav-group'
export { NavUser } from './components/layout/nav-user'
export type { SidebarData, NavGroup as NavGroupType, NavItem, NavCollapsible, NavLink } from './components/layout/types'

// Shared Components
export * from './components/config-drawer'
export * from './components/confirm-dialog'
export * from './components/navigation-progress'
export * from './components/responsive-confirm-dialog'
export * from './components/skip-to-main'
export * from './components/theme-switch'
export * from './components/sign-out-dialog'
export * from './components/profile-dropdown'
export * from './components/command-menu'
export * from './components/search'

// Context Providers
export * from './context/direction-provider'
export {
  LayoutProvider,
  useLayout,
  type Collapsible as LayoutCollapsible,
} from './context/layout-provider'
export * from './context/theme-provider'
export * from './context/search-provider'

// Stores
export * from './stores/auth-store'

// Hooks
export { default as useDialogState } from './hooks/use-dialog-state'
export * from './hooks/use-media-query'
export * from './hooks/use-mobile'
export * from './hooks/useAuth'
export * from './hooks/use-logout'

// Lib utilities
export * from './lib/cookies'
export * from './lib/handle-server-error'
export * from './lib/profile-cookie'
export * from './lib/utils'
export * from './lib/app-path'
export * from './lib/api-client'
export * from './lib/request'
export * from './lib/auth-endpoints'

// Error pages
export * from './features/errors/forbidden'
export * from './features/errors/general-error'
export * from './features/errors/maintenance-error'
export * from './features/errors/not-found-error'
export * from './features/errors/unauthorized-error'

// Custom icons
export { IconDir } from './assets/custom/icon-dir'
export { IconLayoutCompact } from './assets/custom/icon-layout-compact'
export { IconLayoutDefault } from './assets/custom/icon-layout-default'
export { IconLayoutFull } from './assets/custom/icon-layout-full'
export { IconSidebarFloating } from './assets/custom/icon-sidebar-floating'
export { IconSidebarInset } from './assets/custom/icon-sidebar-inset'
export { IconSidebarSidebar } from './assets/custom/icon-sidebar-sidebar'
export { IconThemeDark } from './assets/custom/icon-theme-dark'
export { IconThemeLight } from './assets/custom/icon-theme-light'
export { IconThemeSystem } from './assets/custom/icon-theme-system'
