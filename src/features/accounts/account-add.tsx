import { useState, useEffect, useMemo } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { getProviderLabel, type Provider } from './types'

interface AccountAddProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providers: Provider[]
  onAdd: (type: string, fields: Record<string, string>, addToExisting: boolean) => Promise<void>
  isAdding: boolean
  appBase: string
}

export function AccountAdd({
  open,
  onOpenChange,
  providers,
  onAdd,
  isAdding,
  appBase: _appBase,
}: AccountAddProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [addToExisting, setAddToExisting] = useState(true)

  // Ensure providers is always an array (defensive check)
  const providersList = Array.isArray(providers) ? providers : []

  // Filter out browser provider from the add dialog
  const availableProviders = useMemo(
    () => providersList.filter((p) => p.type !== 'browser'),
    [providersList]
  )

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedType(availableProviders.length === 1 ? availableProviders[0].type : '')
      setFields({})
      setAddToExisting(true)
    }
  }, [open, availableProviders])

  const selectedProvider = providersList.find((p) => p.type === selectedType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAdd(selectedType, fields, addToExisting)
  }

  const handleFieldChange = (name: string, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  const isFormValid = () => {
    if (!selectedProvider) return false
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
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {availableProviders.length > 1 && (
              <div className="grid gap-2">
                <Label htmlFor="type">Account type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map((provider) => (
                      <SelectItem key={provider.type} value={provider.type}>
                        {getProviderLabel(provider.type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedProvider &&
              selectedProvider.fields.map((field) => (
                <div key={field.name} className="grid gap-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    type="text"
                    autoComplete="off"
                    value={fields[field.name] || ''}
                    onChange={(e) =>
                      handleFieldChange(field.name, e.target.value)
                    }
                    required={field.required}
                  />
                </div>
              ))}

            {selectedType && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="font-medium">Add to existing notifications</div>
                <Switch
                  checked={addToExisting}
                  onCheckedChange={setAddToExisting}
                />
              </div>
            )}
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
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
