import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requestHelpers } from '../lib/request'
import type {
  Account,
  Provider,
  AccountsHookResult,
} from '../features/accounts/types'

export function useAccounts(
  appBase: string,
  capability?: string
): AccountsHookResult {
  const queryClient = useQueryClient()
  const queryParams = capability ? `?capability=${capability}` : ''

  const {
    data: providers = [],
    isLoading: isProvidersLoading,
  } = useQuery({
    queryKey: ['accounts', 'providers', appBase, capability],
    queryFn: async () => {
      const res = await requestHelpers.get<Provider[]>(
        `${appBase}/-/accounts/providers${queryParams}`
      )
      return res || []
    },
    staleTime: Infinity,
  })

  const {
    data: accounts = [],
    isLoading: isAccountsLoading,
    refetch,
  } = useQuery({
    queryKey: ['accounts', 'list', appBase, capability],
    queryFn: async () => {
      const res = await requestHelpers.get<Account[]>(
        `${appBase}/-/accounts/list${queryParams}`
      )
      return res || []
    },
  })

  const addMutation = useMutation({
    mutationFn: async ({
      type,
      fields,
    }: {
      type: string
      fields: Record<string, string>
    }) => {
      const formData = new URLSearchParams()
      formData.append('type', type)
      for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value)
      }

      const res = await requestHelpers.post<Account>(
        `${appBase}/-/accounts/add`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts', 'list', appBase],
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const formData = new URLSearchParams()
      formData.append('id', String(id))

      const res = await requestHelpers.post<boolean>(
        `${appBase}/-/accounts/remove`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      return res === true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts', 'list', appBase],
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      fields,
    }: {
      id: number
      fields: Record<string, string>
    }) => {
      const formData = new URLSearchParams()
      formData.append('id', String(id))
      for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value)
      }

      const res = await requestHelpers.post<boolean>(
        `${appBase}/-/accounts/update`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      return res === true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts', 'list', appBase],
      })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async ({ id, code }: { id: number; code?: string }) => {
      const formData = new URLSearchParams()
      formData.append('id', String(id))
      if (code) {
        formData.append('code', code)
      }

      const res = await requestHelpers.post<boolean>(
        `${appBase}/-/accounts/verify`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      return res === true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts', 'list', appBase],
      })
    },
  })

  return {
    providers,
    accounts,
    isLoading: isProvidersLoading || isAccountsLoading,
    isProvidersLoading,
    isAccountsLoading,
    add: async (type: string, fields: Record<string, string>) => {
      const result = await addMutation.mutateAsync({ type, fields })
      if (!result) throw new Error('Failed to add account')
      return result
    },
    remove: async (id: number) => {
      return removeMutation.mutateAsync(id)
    },
    update: async (id: number, fields: Record<string, string>) => {
      return updateMutation.mutateAsync({ id, fields })
    },
    verify: async (id: number, code?: string) => {
      return verifyMutation.mutateAsync({ id, code })
    },
    refetch: () => refetch(),
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isVerifying: verifyMutation.isPending,
  }
}
