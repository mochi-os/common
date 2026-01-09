import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requestHelpers } from '../lib/request'
import * as push from '../lib/push'

interface VapidKeyResponse {
  data: {
    key: string
  }
}

interface Account {
  id: number
  type: string
  identifier: string
  verified: number
}

interface AccountsListResponse {
  data: Account[]
}

interface PushState {
  supported: boolean
  permission: NotificationPermission
  subscribed: boolean
}

export function usePush() {
  const queryClient = useQueryClient()
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: push.getPermission(),
    subscribed: false,
  })

  // Fetch VAPID key from accounts endpoint
  const { data: vapidKey } = useQuery({
    queryKey: ['accounts', 'vapid'],
    queryFn: async () => {
      const res = await requestHelpers.getRaw<VapidKeyResponse>(
        '/notifications/-/accounts/vapid'
      )
      return res?.data?.key || ''
    },
    staleTime: Infinity,
  })

  // Check if browser is subscribed by comparing local subscription with accounts
  useEffect(() => {
    push.isSupported().then((supported) => {
      setState((s) => ({ ...s, supported }))
      if (supported && push.getPermission() === 'granted') {
        navigator.serviceWorker.ready.then((reg) =>
          reg.pushManager
            .getSubscription()
            .then((sub) => setState((s) => ({ ...s, subscribed: !!sub })))
        )
      }
    })
  }, [])

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!vapidKey) throw new Error('No VAPID key')
      const permission = await push.requestPermission()
      if (permission !== 'granted') throw new Error('Permission denied')
      const subscription = await push.subscribe(vapidKey)
      if (!subscription) throw new Error('Subscription failed')

      const subData = push.getSubscriptionData(subscription)
      const formData = new URLSearchParams()
      formData.append('type', 'browser')
      formData.append('endpoint', subData.endpoint)
      formData.append('auth', subData.auth)
      formData.append('p256dh', subData.p256dh)

      await requestHelpers.post(
        '/notifications/-/accounts/add',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
    },
    onSuccess: () => {
      setState((s) => ({ ...s, permission: 'granted', subscribed: true }))
      queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] })
    },
    onError: (error) => {
      console.error('Push subscribe error:', error)
    },
  })

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        // Find the account by endpoint (stored as identifier for browser accounts)
        const res = await requestHelpers.getRaw<AccountsListResponse>(
          '/notifications/-/accounts/list?capability=notify'
        )
        const accounts = res?.data || []
        const account = accounts.find(
          (a) => a.type === 'browser' && a.identifier === sub.endpoint
        )

        if (account) {
          const formData = new URLSearchParams()
          formData.append('id', String(account.id))

          await requestHelpers.post(
            '/notifications/-/accounts/remove',
            formData.toString(),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          )
        }

        await sub.unsubscribe()
      }
    },
    onSuccess: () => {
      setState((s) => ({ ...s, subscribed: false }))
      queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] })
    },
  })

  return {
    ...state,
    subscribe: () => subscribeMutation.mutateAsync(),
    unsubscribe: () => unsubscribeMutation.mutateAsync(),
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
  }
}
