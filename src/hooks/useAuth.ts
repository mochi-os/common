import { useAuthStore } from '../stores/auth-store'

export function useAuth() {
  const token = useAuthStore((state) => state.token)
  const identity = useAuthStore((state) => state.identity)
  const name = useAuthStore((state) => state.name)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  const setLoading = useAuthStore((state) => state.setLoading)
  const setProfile = useAuthStore((state) => state.setProfile)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const initialize = useAuthStore((state) => state.initialize)

  return {
    token,
    identity,
    name,
    isLoading,
    isAuthenticated,
    isInitialized,

    // Actions
    setLoading,
    setProfile,
    initialize,
    logout: clearAuth,
  }
}

export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.isAuthenticated)
}

export function useIsAuthLoading(): boolean {
  return useAuthStore((state) => state.isLoading)
}
