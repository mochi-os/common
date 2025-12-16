import { useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestHelpers } from '../lib/request'
import type { Notification } from '../components/notifications-dropdown'

export interface NotificationCount {
  count: number
  total: number
}

// Query keys for notifications
export const notificationKeys = {
  all: () => ['notifications'] as const,
  list: () => [...notificationKeys.all(), 'list'] as const,
  count: () => [...notificationKeys.all(), 'count'] as const,
}

// API functions
async function fetchNotifications(): Promise<Notification[]> {
  const response = await requestHelpers.get<Notification[]>('/notifications/list')
  return response ?? []
}

async function fetchNotificationCount(): Promise<NotificationCount> {
  const response = await requestHelpers.get<NotificationCount>('/notifications/count')
  return response ?? { count: 0, total: 0 }
}

async function markAsRead(id: string): Promise<void> {
  const formData = new URLSearchParams()
  formData.append('id', id)

  await requestHelpers.post('/notifications/read', formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

async function markAllAsRead(): Promise<void> {
  await requestHelpers.post('/notifications/read/all', {})
}

// Query hooks
export function useNotificationsQuery() {
  return useQuery<Notification[]>({
    queryKey: notificationKeys.list(),
    queryFn: fetchNotifications,
  })
}

export function useNotificationCountQuery() {
  return useQuery<NotificationCount>({
    queryKey: notificationKeys.count(),
    queryFn: fetchNotificationCount,
  })
}

// Mutation hooks
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
    },
  })
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
    },
  })
}

// WebSocket hook for real-time updates
const RECONNECT_DELAY = 3000

function getWebSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/websocket?key=notifications`
}

export function useNotificationWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (!mountedRef.current) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(getWebSocketUrl())
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          switch (data.type) {
            case 'new':
            case 'read':
              queryClient.invalidateQueries({ queryKey: notificationKeys.list() })
              queryClient.invalidateQueries({ queryKey: notificationKeys.count() })
              break

            case 'read_all':
            case 'clear_all':
            case 'clear_app':
            case 'clear_object':
              queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
              break
          }
        } catch {
          // Ignore parse errors
        }
      }

      ws.onclose = () => {
        wsRef.current = null
        if (mountedRef.current) {
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY)
        }
      }

      ws.onerror = () => {
        // Error will trigger onclose
      }
    } catch {
      // Connection failed, retry
      if (mountedRef.current) {
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY)
      }
    }
  }, [queryClient])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])
}

// Combined hook for easy consumption
export function useNotifications() {
  const { data: notifications = [], isLoading, isError } = useNotificationsQuery()
  const { data: count } = useNotificationCountQuery()
  const markAsReadMutation = useMarkAsReadMutation()
  const markAllAsReadMutation = useMarkAllAsReadMutation()

  // Connect WebSocket for real-time updates
  useNotificationWebSocket()

  return {
    notifications,
    count: count ?? { count: 0, total: 0 },
    isLoading,
    isError,
    unreadCount: notifications.filter((n: Notification) => n.read === 0).length,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  }
}
