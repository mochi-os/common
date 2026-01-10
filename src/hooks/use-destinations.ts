import { useQuery } from '@tanstack/react-query'
import { useAccounts } from './use-accounts'
import { requestHelpers } from '../lib/request'

// Destination represents a place where notifications can be sent
export interface Destination {
  type: 'account' | 'rss'
  id: number | string
  label: string
  identifier?: string
  defaultEnabled: boolean
}

interface Feed {
  id: string
  name: string
}

interface DestinationsResponse {
  data: {
    accounts: Array<{
      id: number
      type: string
      label: string
      identifier: string
      enabled: number
    }>
    feeds: Feed[]
  }
}

export interface UseDestinationsResult {
  destinations: Destination[]
  isLoading: boolean
}

// Hook to fetch available notification destinations
export function useDestinations(notificationsBase: string = '/notifications'): UseDestinationsResult {
  const { accounts, isLoading: isAccountsLoading } = useAccounts(notificationsBase, 'notify')

  const { data: destinationsData, isLoading: isDestinationsLoading } = useQuery({
    queryKey: ['destinations', notificationsBase],
    queryFn: async () => {
      return await requestHelpers.get<DestinationsResponse>(
        `${notificationsBase}/-/destinations/list`
      )
    },
  })

  const feeds = destinationsData?.data?.feeds || []

  // Combine accounts and feeds into unified destination list
  const destinations: Destination[] = [
    ...accounts.map((account) => ({
      type: 'account' as const,
      id: account.id,
      label: account.label || account.type,
      identifier: account.identifier,
      defaultEnabled: account.enabled === 1,
    })),
    ...feeds.map((feed) => ({
      type: 'rss' as const,
      id: feed.id,
      label: feed.name,
      identifier: undefined,
      defaultEnabled: true,
    })),
  ]

  return {
    destinations,
    isLoading: isAccountsLoading || isDestinationsLoading,
  }
}
