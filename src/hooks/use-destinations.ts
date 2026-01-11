import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccounts } from './use-accounts'
import { requestHelpers } from '../lib/request'
import { getProviderLabel } from '../features/accounts/types'
import { handlePermissionError } from '../lib/permission-utils'

// Extract app ID from base path (e.g., "/notifications" -> "notifications")
function getAppIdFromBase(base: string): string {
  return base.replace(/^\//, '').split('/')[0] || ''
}

// Destination represents a place where notifications can be sent
export interface Destination {
  type: 'account' | 'rss'
  accountType?: string  // 'browser', 'email', 'url' for accounts
  id: number | string
  label: string
  identifier?: string
  defaultEnabled: boolean
}

interface Feed {
  id: string
  name: string
  enabled: number
}

interface DestinationsResponse {
  accounts: Array<{
    id: number
    type: string
    label: string
    identifier: string
    enabled: number
  }>
  feeds: Feed[]
}

export interface UseDestinationsResult {
  destinations: Destination[]
  isLoading: boolean
}

// Hook to fetch available notification destinations
export function useDestinations(notificationsBase: string = '/notifications'): UseDestinationsResult {
  const { accounts, isLoading: isAccountsLoading } = useAccounts(notificationsBase, 'notify')
  const appId = getAppIdFromBase(notificationsBase)

  const { data: destinationsData, isLoading: isDestinationsLoading } = useQuery({
    queryKey: ['destinations', notificationsBase],
    queryFn: async () => {
      try {
        return await requestHelpers.get<DestinationsResponse>(
          `${notificationsBase}/-/destinations/list`
        )
      } catch (error) {
        if (error && typeof error === 'object' && 'data' in error) {
          const apiError = error as { data?: unknown }
          if (apiError.data) {
            handlePermissionError(apiError.data, appId)
          }
        }
        throw error
      }
    },
  })

  // Combine accounts and feeds into unified destination list
  // Memoize to prevent infinite re-render loops in consumers
  const destinations = useMemo((): Destination[] => {
    const accountsList = Array.isArray(accounts) ? accounts : []
    const feedsList = destinationsData?.feeds ?? []
    return [
      ...accountsList.map((account) => ({
        type: 'account' as const,
        accountType: account.type,
        id: account.id,
        label: account.label || getProviderLabel(account.type),
        identifier: account.identifier,
        defaultEnabled: account.enabled === 1,
      })),
      ...feedsList.map((feed) => ({
        type: 'rss' as const,
        id: feed.id,
        label: feed.name,
        identifier: undefined,
        defaultEnabled: feed.enabled === 1,
      })),
    ]
  }, [accounts, destinationsData])

  return {
    destinations,
    isLoading: isAccountsLoading || isDestinationsLoading,
  }
}
