import { create } from 'zustand'
import { clearProfileCookie, readProfileCookie } from '../lib/profile-cookie'
import { getAppToken } from '../lib/app-path'
import { isInShell, initShellBridge, onShellMessage } from '../lib/shell-bridge'

interface AuthState {
  token: string
  identity: string
  name: string
  isLoading: boolean
  isInitialized: boolean
  isLogoutInProgress: boolean

  isAuthenticated: boolean

  setLoading: (isLoading: boolean) => void
  setToken: (token: string) => void
  setProfile: (identity: string, name: string) => void
  startLogoutTransition: () => void
  endLogoutTransition: () => void
  clearAuth: () => void
  initialize: () => void
  initializeFromShell: () => Promise<void>
  loadIdentity: (force?: boolean) => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const initialToken = isInShell() ? '' : getAppToken()

  return {
    token: initialToken,
    identity: '',
    name: '',
    isLoading: false,
    isInitialized: !isInShell() && Boolean(initialToken),
    isLogoutInProgress: false,
    isAuthenticated: Boolean(initialToken),

    setLoading: (isLoading) => {
      set({ isLoading })
    },

    setToken: (token) => {
      set({
        token,
        isAuthenticated: Boolean(token),
      })
    },

    setProfile: (identity, name) => {
      set({ identity, name })
    },

    startLogoutTransition: () => {
      set({ isLogoutInProgress: true })
    },

    endLogoutTransition: () => {
      set({ isLogoutInProgress: false })
    },

    clearAuth: () => {
      clearProfileCookie()

      set({
        token: '',
        identity: '',
        name: '',
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      })
    },

    initialize: () => {
      // In shell mode, initialization is async — kick off initializeFromShell()
      if (isInShell()) {
        get().initializeFromShell()
        return
      }

      const metaToken = getAppToken()
      const storeToken = get().token
      const profile = readProfileCookie()
      const profileName = profile.name || ''

      if (metaToken !== storeToken) {
        set({
          token: metaToken,
          identity: '',
          name: metaToken ? profileName : '',
          isAuthenticated: Boolean(metaToken),
          isInitialized: true,
          isLogoutInProgress: false,
        })
      } else {
        set({
          identity: metaToken ? get().identity : '',
          name: metaToken ? profileName : '',
          isInitialized: true,
          isLogoutInProgress: false,
        })
      }
    },

    // Initialize from shell postMessage — used when running inside sandboxed iframe
    initializeFromShell: async () => {
      const data = await initShellBridge()
      set({
        token: data.token,
        name: data.user?.name || '',
        isAuthenticated: Boolean(data.token),
        isInitialized: true,
        isLogoutInProgress: false,
      })

      // Listen for token refreshes from shell
      onShellMessage((msg) => {
        if (msg.type === 'token-refresh' && typeof msg.token === 'string') {
          set({ token: msg.token, isAuthenticated: Boolean(msg.token) })
        }
      })
    },

    // @deprecated Use authManager.loadIdentity() instead
    loadIdentity: async (force?: boolean) => {
      // Delegate to centralized manager to avoid fragmentation
      const { authManager } = await import('../lib/auth-manager')
      await authManager.loadIdentity(force)
    },
  }
})
