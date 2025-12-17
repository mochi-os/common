import { useEffect } from 'react'
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

// WebSocket singleton for real-time updates
// Module-level state ensures only one WebSocket connection per browser tab
const RECONNECT_DELAY = 3000

interface WebSocketState {
  instance: WebSocket | null
  reconnectTimer: ReturnType<typeof setTimeout> | null
  subscriberCount: number
  queryClientRef: ReturnType<typeof useQueryClient> | null
}

const wsState: WebSocketState = {
  instance: null,
  reconnectTimer: null,
  subscriberCount: 0,
  queryClientRef: null,
}

function getWebSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/_/websocket?key=notifications`
}

function handleWebSocketMessage(event: MessageEvent) {
  if (!wsState.queryClientRef) return
  
  try {
    const data = JSON.parse(event.data)

    switch (data.type) {
      case 'new':
      case 'read':
        wsState.queryClientRef.invalidateQueries({ queryKey: notificationKeys.list() })
        wsState.queryClientRef.invalidateQueries({ queryKey: notificationKeys.count() })
        break

      case 'read_all':
      case 'clear_all':
      case 'clear_app':
      case 'clear_object':
        wsState.queryClientRef.invalidateQueries({ queryKey: notificationKeys.all() })
        break
    }
  } catch {
    // Ignore parse errors
  }
}

function connectWebSocket() {
  if (wsState.instance?.readyState === WebSocket.OPEN) return
  if (wsState.instance?.readyState === WebSocket.CONNECTING) return
  
  try {
    const ws = new WebSocket(getWebSocketUrl())
    wsState.instance = ws

    ws.onmessage = handleWebSocketMessage

    ws.onclose = () => {
      wsState.instance = null
      // Only reconnect if there are still subscribers
      if (wsState.subscriberCount > 0) {
        wsState.reconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY)
      }
    }

    ws.onerror = () => {
      // Error will trigger onclose
    }
  } catch {
    // Connection failed, retry if subscribers exist
    if (wsState.subscriberCount > 0) {
      wsState.reconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY)
    }
  }
}

function disconnectWebSocket() {
  if (wsState.reconnectTimer) {
    clearTimeout(wsState.reconnectTimer)
    wsState.reconnectTimer = null
  }
  if (wsState.instance) {
    wsState.instance.close()
    wsState.instance = null
  }
}

export function useNotificationWebSocket() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Store queryClient reference for message handling
    wsState.queryClientRef = queryClient
    wsState.subscriberCount++

    // Connect if this is the first subscriber
    if (wsState.subscriberCount === 1) {
      connectWebSocket()
    }

    return () => {
      wsState.subscriberCount--

      // Disconnect if no more subscribers
      if (wsState.subscriberCount === 0) {
        disconnectWebSocket()
        wsState.queryClientRef = null
      }
    }
  }, [queryClient])
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
