import { create } from 'zustand'
import { removeCookie, getCookie } from '../lib/cookies'
import { requestHelpers } from '../lib/request'

const TOKEN_COOKIE = 'token'

interface AuthState {
  token: string
  identity: string
  name: string
  isLoading: boolean
  isInitialized: boolean

  isAuthenticated: boolean

  setLoading: (isLoading: boolean) => void
  setProfile: (identity: string, name: string) => void
  clearAuth: () => void
  initialize: () => void
  loadIdentity: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const initialToken = getCookie(TOKEN_COOKIE) || ''

  return {
    token: initialToken,
    identity: '',
    name: '',
    isLoading: false,
    isInitialized: false,
    isAuthenticated: Boolean(initialToken),

    setLoading: (isLoading) => {
      set({ isLoading })
    },

    setProfile: (identity, name) => {
      set({ identity, name })
    },

    clearAuth: () => {
      removeCookie(TOKEN_COOKIE)

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
      const cookieToken = getCookie(TOKEN_COOKIE) || ''
      const storeToken = get().token

      if (cookieToken !== storeToken) {
        set({
          token: cookieToken,
          isAuthenticated: Boolean(cookieToken),
          isInitialized: true,
        })
      } else {
        set({ isInitialized: true })
      }
    },

    loadIdentity: async () => {
      const { token, name } = get()
      if (!token || name) return

      try {
        const data = await requestHelpers.get<{ user: any; identity?: any }>('/_/identity')
        if (data.identity) {
          set({ identity: data.identity.id, name: data.identity.name })
        } else if (data.user) {
          set({ identity: '', name: data.user.email })
        }
      } catch (error) {
        if (requestHelpers.isAuthError(error)) {
          removeCookie(TOKEN_COOKIE)
          set({
            token: '',
            identity: '',
            name: '',
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          })
          
          if (typeof window !== 'undefined') {
             const returnUrl = encodeURIComponent(window.location.href)
             const loginUrl = (import.meta as any).env.VITE_AUTH_LOGIN_URL || '/login'
             window.location.href = `${loginUrl}?redirect=${returnUrl}`
          }
        }
      }
    },
  }
})
