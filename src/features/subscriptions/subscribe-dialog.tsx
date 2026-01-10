import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bell, Loader2, Mail, Rss, Webhook } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Switch } from '../../components/ui/switch'
import { Skeleton } from '../../components/ui/skeleton'
import { requestHelpers } from '../../lib/request'
import { getErrorMessage } from '../../lib/handle-server-error'
import { toast } from '../../lib/toast-utils'
import { useDestinations } from '../../hooks/use-destinations'
import type { SubscribeDialogProps, DestinationToggle } from './types'

interface CreateResponse {
  data: { id: number }
}

function getDestinationIcon(type: string, accountType?: string) {
  if (type === 'rss') {
    return <Rss className="h-4 w-4" />
  }
  switch (accountType) {
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'browser':
      return <Bell className="h-4 w-4" />
    case 'url':
      return <Webhook className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

export function SubscribeDialog({
  open,
  onOpenChange,
  app,
  label,
  type = '',
  object = '',
  notificationsBase,
  onResult,
}: SubscribeDialogProps) {
  const { destinations, isLoading } = useDestinations(notificationsBase)
  const [toggles, setToggles] = useState<DestinationToggle[]>([])

  // Initialize toggles when destinations load
  useEffect(() => {
    if (destinations.length > 0 && toggles.length === 0) {
      setToggles(
        destinations.map((d) => ({
          type: d.type,
          id: d.id,
          label: d.label,
          identifier: d.identifier,
          enabled: d.defaultEnabled,
        }))
      )
    }
  }, [destinations, toggles.length])

  // Reset toggles when dialog closes
  useEffect(() => {
    if (!open) {
      setToggles([])
    }
  }, [open])

  const createMutation = useMutation({
    mutationFn: async () => {
      const enabledDestinations = toggles
        .filter((t) => t.enabled)
        .map((t) => ({
          type: t.type,
          target: String(t.id),
        }))

      const formData = new URLSearchParams()
      formData.append('app', app)
      formData.append('label', label)
      if (type) formData.append('type', type)
      if (object) formData.append('object', object)
      formData.append('destinations', JSON.stringify(enabledDestinations))

      return await requestHelpers.post<CreateResponse>(
        `${notificationsBase}/-/subscriptions/create`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
    },
    onSuccess: (data) => {
      toast.success('Subscription created')
      onResult?.(data.data.id)
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to create subscription'))
    },
  })

  const handleToggle = (id: number | string) => {
    setToggles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    )
  }

  const handleAccept = () => {
    const hasEnabled = toggles.some((t) => t.enabled)
    if (!hasEnabled) {
      toast.error('Please select at least one destination')
      return
    }
    createMutation.mutate()
  }

  const handleRefuse = () => {
    onResult?.(null)
    onOpenChange(false)
  }

  const hasDestinations = destinations.length > 0 || toggles.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enable notifications</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{app}</span> would like to send you
            notifications for: {label}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !hasDestinations ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>No notification destinations configured.</p>
              <p className="text-sm mt-1">
                Add destinations in Settings to receive notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                Choose where to receive these notifications:
              </p>
              {toggles.map((toggle) => (
                <div
                  key={`${toggle.type}-${toggle.id}`}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {getDestinationIcon(toggle.type, toggle.label)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{toggle.label}</div>
                      {toggle.identifier && (
                        <div className="text-xs text-muted-foreground">
                          {toggle.identifier}
                        </div>
                      )}
                    </div>
                  </div>
                  <Switch
                    id={`toggle-${toggle.type}-${toggle.id}`}
                    checked={toggle.enabled}
                    onCheckedChange={() => handleToggle(toggle.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleRefuse}>
            Not now
          </Button>
          <Button
            onClick={handleAccept}
            disabled={createMutation.isPending || !hasDestinations}
          >
            {createMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Allow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
