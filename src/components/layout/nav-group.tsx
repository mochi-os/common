import { type ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from '../ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  type NavAction,
  type NavCollapsible,
  type NavItem,
  type NavLink,
  type NavSubCollapsible,
  type NavGroup as NavGroupProps,
} from './types'

// Type guards
function isNavAction(item: NavItem | NavSubCollapsible | { url?: string; onClick?: () => void; items?: unknown[] }): item is NavAction {
  return 'onClick' in item && typeof item.onClick === 'function' && !('items' in item && item.items)
}

function isNavLink(item: NavItem): item is NavLink {
  return 'url' in item && !('items' in item && item.items)
}

function isNavSubCollapsible(item: unknown): item is NavSubCollapsible {
  return typeof item === 'object' && item !== null && 'items' in item && Array.isArray((item as NavSubCollapsible).items)
}

export function NavGroup({ title, items, separator }: NavGroupProps) {
  const { state, isMobile } = useSidebar()
  const pathname = useLocation({ select: (location) => location.pathname })
  return (
    <>
      {separator && <SidebarSeparator className='mx-2' />}
      <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${'url' in item ? item.url : 'action'}`

          if (isNavAction(item)) {
            return <SidebarMenuAction key={key} item={item} />
          }

          if (isNavLink(item)) {
            return <SidebarMenuLink key={key} item={item} pathname={pathname} />
          }

          if (state === 'collapsed' && !isMobile)
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                pathname={pathname}
              />
            )

          return (
            <SidebarMenuCollapsible key={key} item={item} pathname={pathname} />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
    </>
  )
}

function NavBadge({ children }: { children: ReactNode }) {
  return <Badge variant='destructive' className='rounded-full px-1 py-0 text-xs'>{children}</Badge>
}

function SidebarMenuAction({ item }: { item: NavAction }) {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        onClick={() => {
          setOpenMobile(false)
          item.onClick()
        }}
        variant={item.variant}
      >
        {item.icon && <item.icon />}
        <span>{item.title}</span>
        {item.badge && <NavBadge>{item.badge}</NavBadge>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarMenuLink({
  item,
  pathname,
}: {
  item: NavLink
  pathname: string
}) {
  const { setOpenMobile } = useSidebar()
  if (item.external) {
    // Use explicit isActive prop if provided, otherwise check pathname
    const isActive = item.isActive ?? checkIsActive(pathname, item)
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
          <a href={item.url as string} onClick={() => setOpenMobile(false)}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }
  // Use explicit isActive prop if provided, otherwise check pathname
  const isActive = item.isActive ?? checkIsActive(pathname, item)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
      >
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarMenuCollapsible({
  item,
  pathname,
}: {
  item: NavCollapsible
  pathname: string
}) {
  const { setOpenMobile } = useSidebar()

  // Render header - either as a link (if url provided) or just text
  const headerContent = (
    <>
      {item.icon && <item.icon />}
      <span>{item.title}</span>
      {item.badge && <NavBadge>{item.badge}</NavBadge>}
    </>
  )

  // Use controlled mode if `open` prop is provided, otherwise use uncontrolled
  const isControlled = typeof item.open === 'boolean'
  const collapsibleProps = isControlled
    ? { open: item.open }
    : { defaultOpen: checkIsActive(pathname, item, true) }

  // Only highlight if open (for controlled items) or URL matches (for uncontrolled)
  const shouldHighlight = isControlled
    ? item.open && checkIsActive(pathname, item)
    : checkIsActive(pathname, item)

  return (
    <Collapsible
      asChild
      {...collapsibleProps}
      className='group/collapsible'
    >
      <SidebarMenuItem>
        <div className='flex items-center'>
          {item.url ? (
            item.external ? (
              <SidebarMenuButton
                asChild
                isActive={shouldHighlight}
                tooltip={item.title}
                className='flex-1'
              >
                <a href={item.url as string} onClick={() => setOpenMobile(false)}>
                  {headerContent}
                </a>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                asChild
                isActive={shouldHighlight}
                tooltip={item.title}
                className='flex-1'
              >
                <Link to={item.url} onClick={() => setOpenMobile(false)}>
                  {headerContent}
                </Link>
              </SidebarMenuButton>
            )
          ) : (
            <SidebarMenuButton tooltip={item.title} className='flex-1 cursor-default'>
              {headerContent}
            </SidebarMenuButton>
          )}
          <CollapsibleTrigger asChild>
            <button
              type='button'
              className='p-1.5 hover:bg-hover rounded-md transition-colors'
            >
              <ChevronRight className='size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180' />
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className='CollapsibleContent'>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              // Handle nested collapsible sub-items
              if (isNavSubCollapsible(subItem)) {
                return (
                  <SidebarMenuSubCollapsible
                    key={subItem.title}
                    item={subItem}
                    pathname={pathname}
                  />
                )
              }
              // Handle action sub-items
              if (isNavAction(subItem)) {
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      className='cursor-pointer'
                      onClick={() => {
                        setOpenMobile(false)
                        subItem.onClick()
                      }}
                    >
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              }
              // Handle link sub-items
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={'url' in subItem ? checkIsActive(pathname, subItem) : false}
                  >
                    <Link to={'url' in subItem ? subItem.url : '#'} onClick={() => setOpenMobile(false)}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function SidebarMenuSubCollapsible({
  item,
  pathname,
}: {
  item: NavSubCollapsible
  pathname: string
}) {
  const { setOpenMobile } = useSidebar()

  // Use controlled mode if `open` prop is provided
  const isControlled = typeof item.open === 'boolean'
  const collapsibleProps = isControlled
    ? { open: item.open }
    : { defaultOpen: checkIsActive(pathname, item, true) }

  // Only highlight if open (for controlled items) or URL matches (for uncontrolled)
  const shouldHighlight = isControlled
    ? item.open && checkIsActive(pathname, item)
    : checkIsActive(pathname, item)

  const headerContent = (
    <>
      {item.icon && <item.icon />}
      <span>{item.title}</span>
      {item.badge && <NavBadge>{item.badge}</NavBadge>}
    </>
  )

  return (
    <SidebarMenuSubItem>
      <Collapsible {...collapsibleProps} className='group/subcollapsible'>
        <div className='flex items-center'>
          {item.url ? (
            <SidebarMenuSubButton
              asChild
              isActive={shouldHighlight}
              className='flex-1'
            >
              <Link to={item.url} onClick={() => setOpenMobile(false)}>
                {headerContent}
              </Link>
            </SidebarMenuSubButton>
          ) : (
            <SidebarMenuSubButton className='flex-1 cursor-default'>
              {headerContent}
            </SidebarMenuSubButton>
          )}
          <CollapsibleTrigger asChild>
            <button
              type='button'
              className='p-1 hover:bg-hover rounded-md transition-colors'
            >
              <ChevronRight className='size-3 transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90 rtl:rotate-180' />
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub className='ml-2 border-l pl-2'>
            {item.items.map((subSubItem) => {
              // Handle action sub-sub-items
              if (isNavAction(subSubItem)) {
                return (
                  <SidebarMenuSubItem key={subSubItem.title}>
                    <SidebarMenuSubButton
                      className='cursor-pointer'
                      onClick={() => {
                        setOpenMobile(false)
                        subSubItem.onClick()
                      }}
                    >
                      {subSubItem.icon && <subSubItem.icon />}
                      <span>{subSubItem.title}</span>
                      {subSubItem.badge && <NavBadge>{subSubItem.badge}</NavBadge>}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              }
              // Handle link sub-sub-items
              return (
                <SidebarMenuSubItem key={subSubItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={'url' in subSubItem ? checkIsActive(pathname, subSubItem) : false}
                  >
                    <Link to={'url' in subSubItem ? subSubItem.url : '#'} onClick={() => setOpenMobile(false)}>
                      {subSubItem.icon && <subSubItem.icon />}
                      <span>{subSubItem.title}</span>
                      {subSubItem.badge && <NavBadge>{subSubItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuSubItem>
  )
}

function SidebarMenuCollapsedDropdown({
  item,
  pathname,
}: {
  item: NavCollapsible
  pathname: string
}) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(pathname, item)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='right' align='start' sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                to={sub.url}
                className={`${checkIsActive(pathname, sub) ? 'bg-secondary' : ''}`}
              >
                {sub.icon && <sub.icon />}
                <span className='max-w-52 text-wrap'>{sub.title}</span>
                {sub.badge && (
                  <span className='ms-auto text-xs'>{sub.badge}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(pathname: string, item: NavItem, mainNav = false) {
  // Normalize paths for comparison
  const normalizePath = (path: string): string => {
    if (!path) return '/'
    // Handle relative paths like './' or '.'
    if (path === './' || path === '.') {
      return '/'
    }
    // Remove trailing slashes for consistent comparison (except for root)
    const trimmed = path.replace(/\/$/, '')
    return trimmed || '/'
  }

  const normalizedPathname = normalizePath(pathname)
  const normalizedItemUrl = normalizePath(item.url as string)

  // Check for exact match
  if (normalizedPathname === normalizedItemUrl) {
    return true
  }

  // Check for prefix match (e.g., /abc123/settings matches /abc123)
  // But not for root URL to avoid matching everything
  if (normalizedItemUrl !== '/' && normalizedPathname.startsWith(normalizedItemUrl + '/')) {
    return true
  }

  // Check if any child nav item is active
  if (item?.items?.length) {
    const hasActiveChild = item.items.some((i) => {
      const normalizedChildUrl = normalizePath(i.url as string)
      return normalizedPathname === normalizedChildUrl
    })
    if (hasActiveChild) {
      return true
    }
  }

  // For main nav items, check if the first segment matches
  if (mainNav) {
    const pathnameSegments = normalizedPathname.split('/').filter(Boolean)
    const itemUrlSegments = normalizedItemUrl.split('/').filter(Boolean)
    if (pathnameSegments.length > 0 && itemUrlSegments.length > 0) {
      return pathnameSegments[0] === itemUrlSegments[0]
    }
  }

  return false
}
