'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Loader2, type LucideIcon } from 'lucide-react'
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from './ui/responsive-dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { toast } from '../lib/toast-utils'
import { cn } from '../lib/utils'
import { requestHelpers } from '../lib/request'

interface DirectoryEntry {
  id: string
  name: string
  fingerprint?: string
  class?: string
}

interface SearchEntityDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Called when user clicks subscribe on an entity */
  onSubscribe: (entityId: string, entity: DirectoryEntry) => Promise<void>
  /** Set of already subscribed entity IDs or fingerprints */
  subscribedIds?: Set<string>
  /** Entity class being searched (e.g., "feed", "forum", "wiki") */
  entityClass: string
  /** API endpoint for directory search (e.g., "/feeds/directory/search") */
  searchEndpoint: string
  /** Icon to display for each result */
  icon: LucideIcon
  /** Tailwind classes for icon container (e.g., "bg-orange-500/10 text-orange-600") */
  iconClassName?: string
  /** Dialog title (e.g., "Search feeds") */
  title: string
  /** Dialog description */
  description?: string
  /** Input placeholder */
  placeholder?: string
  /** Empty state message when no results */
  emptyMessage?: string
  /** Label for subscribe button */
  subscribeLabel?: string
  /** Label shown when already subscribed */
  subscribedLabel?: string
}

export function SearchEntityDialog({
  open,
  onOpenChange,
  onSubscribe,
  subscribedIds = new Set(),
  entityClass,
  searchEndpoint,
  icon: Icon,
  iconClassName = 'bg-primary/10 text-primary',
  title,
  description = 'Search the directory',
  placeholder = 'Search...',
  emptyMessage = 'No results found',
  subscribeLabel = 'Subscribe',
  subscribedLabel = 'Subscribed',
}: SearchEntityDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setDebouncedSearch('')
    }
  }, [open])

  // Search query
  const { data, isLoading, isError } = useQuery({
    queryKey: [entityClass, 'directory-search', debouncedSearch],
    queryFn: async () => {
      const response = await requestHelpers.get<DirectoryEntry[] | { results: DirectoryEntry[] }>(
        `${searchEndpoint}?search=${encodeURIComponent(debouncedSearch)}`
      )
      // Handle both array response and { results: [] } response formats
      return Array.isArray(response) ? response : (response.results || [])
    },
    enabled: debouncedSearch.length > 0 && open,
  })

  const results = data || []

  const handleSubscribe = async (entity: DirectoryEntry) => {
    try {
      await onSubscribe(entity.id, entity)
      toast.success(`Subscribed to ${entity.name}`)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to subscribe:', error)
      toast.error('Failed to subscribe')
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldCloseOnInteractOutside={false}
    >
      <ResponsiveDialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-[600px] overflow-hidden border-none shadow-2xl">
        <ResponsiveDialogHeader className="border-b px-4 py-4 bg-muted/30">
          <ResponsiveDialogTitle className="text-xl font-semibold tracking-tight">
            {title}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-xs">
            {description}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="p-4 border-b bg-background">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4 bg-muted/10 h-[400px] overflow-y-scroll">
          {isLoading && debouncedSearch && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="text-primary size-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          )}

          {isError && (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-sm font-medium">Search failed</p>
            </div>
          )}

          {!isLoading && !isError && debouncedSearch && results.length === 0 && (
            <div className="py-12 text-center">
              <div className="bg-muted/50 rounded-full p-4 w-fit mx-auto mb-3">
                <Icon className="text-muted-foreground size-8" />
              </div>
              <h3 className="font-semibold text-sm">{emptyMessage}</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Try a different search term
              </p>
            </div>
          )}

          {!debouncedSearch && (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Search className="size-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Start typing to search</p>
              <p className="text-xs opacity-70">
                Search by name, entity ID, fingerprint, or URL
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2 space-y-1">
              {results.map((entity) => {
                const isSubscribed = subscribedIds.has(entity.fingerprint || entity.id)

                return (
                  <div
                    key={entity.fingerprint || entity.id}
                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-background hover:shadow-sm border border-transparent hover:border-border transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        "flex items-center justify-center size-10 rounded-full shrink-0",
                        iconClassName
                      )}>
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-sm leading-none mb-1">
                          {entity.name}
                        </div>
                        {entity.fingerprint && (
                          <div className="text-muted-foreground text-xs truncate opacity-80 font-mono">
                            {entity.fingerprint.match(/.{1,3}/g)?.join('-')}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isSubscribed ? 'outline' : 'secondary'}
                      disabled={isSubscribed}
                      onClick={() => handleSubscribe(entity)}
                      className={cn(
                        'h-8 px-4 rounded-full transition-all',
                        isSubscribed
                          ? 'opacity-50'
                          : 'opacity-0 group-hover:opacity-100'
                      )}
                    >
                      {isSubscribed ? subscribedLabel : subscribeLabel}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
