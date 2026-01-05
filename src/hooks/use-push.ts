import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { requestHelpers } from '../lib/request'
import * as push from '../lib/push'

interface PushKeyResponse {
  data: {
    key: string
  }
}

interface PushState {
  supported: boolean
  permission: NotificationPermission
  subscribed: boolean
}

export function usePush() {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: push.getPermission(),
    subscribed: false,
  })

  const { data: vapidKey } = useQuery({
    queryKey: ['push', 'vapid'],
    queryFn: async () => {
      const res = await requestHelpers.getRaw<PushKeyResponse>(
        '/notifications/push/key'
      )
      return res?.data?.key || ''
    },
    staleTime: Infinity,
  })

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
      formData.append('endpoint', subData.endpoint)
      formData.append('auth', subData.auth)
      formData.append('p256dh', subData.p256dh)

      await requestHelpers.post(
        '/notifications/push/subscribe',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
    },
    onSuccess: () =>
      setState((s) => ({ ...s, permission: 'granted', subscribed: true })),
  })

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        const formData = new URLSearchParams()
        formData.append('endpoint', sub.endpoint)

        await requestHelpers.post(
          '/notifications/push/unsubscribe',
          formData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
        await sub.unsubscribe()
      }
    },
    onSuccess: () => setState((s) => ({ ...s, subscribed: false })),
  })

  return {
    ...state,
    subscribe: () => subscribeMutation.mutate(),
    unsubscribe: () => unsubscribeMutation.mutate(),
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
  }
}
