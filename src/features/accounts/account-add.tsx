import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Switch } from '../../components/ui/switch'
import * as push from '../../lib/push'
import type { Provider } from './types'

interface AccountAddProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providers: Provider[]
  onAdd: (type: string, fields: Record<string, string>) => Promise<void>
  isAdding: boolean
  appBase: string
}

export function AccountAdd({
  open,
  onOpenChange,
  providers,
  onAdd,
  isAdding,
  appBase,
}: AccountAddProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [browserPushEnabled, setBrowserPushEnabled] = useState(false)
  const [browserPushSupported, setBrowserPushSupported] = useState(false)

  // Check browser push support
  useEffect(() => {
    push.isSupported().then(setBrowserPushSupported)
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedType(providers.length === 1 ? providers[0].type : '')
      setFields({})
      setBrowserPushEnabled(false)
    }
  }, [open, providers])

  const selectedProvider = providers.find((p) => p.type === selectedType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedType === 'browser') {
      // Handle browser push subscription
      try {
        const permission = await push.requestPermission()
        if (permission !== 'granted') {
          throw new Error('Permission denied')
        }

        // Get VAPID key from server
        const keyRes = await fetch(`${appBase}/-/accounts/vapid`)
        const keyData = await keyRes.json()
        const vapidKey = keyData?.data?.key

        if (!vapidKey) {
          throw new Error('No VAPID key available')
        }

        const subscription = await push.subscribe(vapidKey)
        if (!subscription) {
          throw new Error('Subscription failed')
        }

        const subData = push.getSubscriptionData(subscription)
        await onAdd('browser', {
          endpoint: subData.endpoint,
          auth: subData.auth,
          p256dh: subData.p256dh,
          label: fields.label || '',
        })
      } catch (error) {
        console.error('Browser push subscription failed:', error)
        throw error
      }
    } else {
      await onAdd(selectedType, fields)
    }
  }

  const handleFieldChange = (name: string, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  const isFormValid = () => {
    if (!selectedProvider) return false
    if (selectedType === 'browser') return browserPushSupported

    for (const field of selectedProvider.fields) {
      if (field.required && !fields[field.name]) {
        return false
      }
    }
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} autoComplete="off">
          <DialogHeader>
            <DialogTitle>Add account</DialogTitle>
            <DialogDescription>
              Connect an external account to enable notifications and services.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {providers.length > 1 && (
              <div className="grid gap-2">
                <Label htmlFor="type">Account type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.type} value={provider.type}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedType === 'browser' && (
              <div className="space-y-4">
                {browserPushSupported ? (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">Browser notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive push notifications in this browser
                      </div>
                    </div>
                    <Switch
                      checked={browserPushEnabled}
                      onCheckedChange={setBrowserPushEnabled}
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    Browser push notifications are not supported in this
                    browser.
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="label">Label (optional)</Label>
                  <Input
                    id="label"
                    value={fields.label || ''}
                    onChange={(e) => handleFieldChange('label', e.target.value)}
                    placeholder="Work browser, Home laptop, etc."
                  />
                </div>
              </div>
            )}

            {selectedProvider &&
              selectedType !== 'browser' &&
              selectedProvider.fields.map((field) => (
                <div key={field.name} className="grid gap-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id={field.name}
                    type="text"
                    autoComplete="off"
                    value={fields[field.name] || ''}
                    onChange={(e) =>
                      handleFieldChange(field.name, e.target.value)
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || !isFormValid()}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedType === 'browser' ? 'Enable' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
