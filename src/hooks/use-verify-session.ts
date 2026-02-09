import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth-store'
import { authManager } from '../lib/auth-manager'

/**
 * Hook to proactively verify the user's identity if they have a token but no profile data.
 * This ensures that sessions are validated when the user returns to the app.
 */
export function useVerifySession() {
  const token = useAuthStore((state) => state.token)
  const name = useAuthStore((state) => state.name)

  useEffect(() => {
    // 1. Proactive check on return/load (if token exists but no name/profile data yet)
    if (token && !name) {
      authManager.loadIdentity()
    }

    // 2. Background check (every 30 mins) if tab stays open
    const interval = setInterval(() => {
      if (token) {
        authManager.loadIdentity()
      }
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [token, name])
}
