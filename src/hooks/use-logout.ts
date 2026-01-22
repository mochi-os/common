import { useCallback } from 'react'
import { toast } from '../lib/toast-utils'
import { authEndpoints } from '../lib/auth-endpoints'
import { removeCookie } from '../lib/cookies'
import { requestHelpers } from '../lib/request'
import { useAuth } from './useAuth'
import { getAuthLoginUrl } from '../lib/app-path'

export function useLogout() {
  const { logout: clearAuth, setLoading, isLoading } = useAuth()

  const logout = useCallback(async () => {
    try {
      setLoading(true)

      try {
        await requestHelpers.post(authEndpoints.logout)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[Logout] Backend logout failed:', error)
        }
      }

      removeCookie('token')
      clearAuth()

      toast.success('Logged out successfully')

      window.location.href = getAuthLoginUrl()
    } catch (_error) {
      removeCookie('token')
      clearAuth()

      toast.error('Logged out (with errors)')

      window.location.href = getAuthLoginUrl()
    } finally {
      setLoading(false)
    }
  }, [clearAuth, setLoading])

  return {
    logout,
    isLoggingOut: isLoading,
  }
}
