import { useCallback } from 'react'
import { toast } from '../lib/toast-utils'
import { useAuth } from './useAuth'
import { authManager } from '../lib/auth-manager'

export function useLogout() {
  const { setLoading, isLoading } = useAuth()

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await authManager.logout()
      toast.success('Logged out successfully')
    } catch (_error) {
      toast.error('Logged out (with errors)')
      await authManager.logout('Force logout after error')
    } finally {
      // Note: Because authManager.logout redirects, this might not run or matter
      setLoading(false)
    }
  }, [setLoading])

  return {
    logout,
    isLoggingOut: isLoading,
  }
}
