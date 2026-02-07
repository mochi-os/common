import { create } from 'zustand'
import { removeCookie, getCookie } from '../lib/cookies'
import { readProfileCookie } from '../lib/profile-cookie'

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
      const profile = readProfileCookie()

      if (cookieToken !== storeToken) {
        set({
          token: cookieToken,
          isAuthenticated: Boolean(cookieToken),
          isInitialized: true,
          name: profile.name || '',
        })
      } else {
        set({ isInitialized: true, name: profile.name || '' })
      }
    },
  }
})
