// Types for notification subscriptions

export interface SubscriptionDestination {
  type: 'account' | 'rss'
  target: string
}

export interface Subscription {
  id: number
  app: string
  type: string
  object: string
  label: string
  created: number
  destinations: SubscriptionDestination[]
}

export interface SubscribeButtonProps {
  app: string
  label: string
  type?: string
  object?: string
  onResult?: (subscriptionId: number | null) => void
  notificationsBase?: string
  children?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  className?: string
}

export interface SubscribeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  app: string
  label: string
  type?: string
  object?: string
  notificationsBase: string
  onResult?: (subscriptionId: number | null) => void
}

export interface DestinationToggle {
  type: 'account' | 'rss'
  id: number | string
  label: string
  identifier?: string
  enabled: boolean
}
