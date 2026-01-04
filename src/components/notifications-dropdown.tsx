import { useState, useEffect } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { NotificationBadge } from './ui/notification-badge'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { ScrollArea } from './ui/scroll-area'
import { Switch } from './ui/switch'
import { Label } from './ui/label'

export interface Notification {
  id: string
  app: string
  category: string
  object: string
  content: string
  link: string
  count: number
  created: number
  read: number
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`

  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface NotificationItemProps {
  notification: Notification
  onClick?: (notification: Notification) => void
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const isUnread = notification.read === 0

  return (
    <button
      type="button"
      onClick={() => onClick?.(notification)}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-hover',
        isUnread && 'bg-hover/40'
      )}
    >
      {isUnread && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      )}
      <div className={cn('flex-1 min-w-0', !isUnread && 'ml-5')}>
        <p className="text-sm leading-snug">
          {notification.content}
          {notification.count > 1 && (
            <span className="text-muted-foreground"> ({notification.count})</span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatTimestamp(notification.created)}
        </p>
      </div>
    </button>
  )
}

type NotificationsDropdownProps = {
  notifications?: Notification[]
  notificationsUrl?: string
  onMarkAllAsRead?: () => void
  onNotificationClick?: (notification: Notification) => void
  buttonClassName?: string
}

const STORAGE_KEY = 'notifications-show-all'

export function NotificationsDropdown({
  notifications = [],
  notificationsUrl,
  onMarkAllAsRead,
  onNotificationClick,
  buttonClassName,
}: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(showAll))
  }, [showAll])

  const unreadCount = notifications.filter((n) => n.read === 0).length
  const displayedNotifications = showAll
    ? notifications
    : notifications.filter((n) => n.read === 0)

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification)
    if (notification.link) {
      setOpen(false)
      window.location.href = notification.link
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', buttonClassName)}
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <NotificationBadge className="absolute -right-0.5 -top-0.5 size-4">
              {unreadCount > 9 ? '9+' : unreadCount}
            </NotificationBadge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          {notificationsUrl ? (
            <a
              href={notificationsUrl}
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 font-medium hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Notifications
            </a>
          ) : (
            <span className="font-medium">Notifications</span>
          )}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => onMarkAllAsRead?.()}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Check className="size-3" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter toggle */}
        <div
          className="flex items-center justify-between border-b px-4 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Label htmlFor="show-all" className="text-xs text-muted-foreground">
            Show all
          </Label>
          <Switch
            id="show-all"
            checked={showAll}
            onCheckedChange={setShowAll}
          />
        </div>

        {/* List */}
        <ScrollArea className="max-h-80">
          <div className="bg-popover">
            {displayedNotifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {showAll ? 'No notifications' : 'No unread notifications'}
              </div>
            ) : (
              <div className="divide-y">
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

      </PopoverContent>
    </Popover>
  )
}
