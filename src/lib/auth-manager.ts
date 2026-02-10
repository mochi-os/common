import { useAuthStore } from '../stores/auth-store'
import { authEndpoints } from './auth-endpoints'
import { requestHelpers } from './request'
import { removeCookie } from './cookies'
import { getAuthLoginUrl } from './app-path'
import { mergeProfileCookie } from './profile-cookie'

class AuthManager {
  private static instance: AuthManager
  private isLoggingOut = false
  private isVerifying = false

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
      
      // Prevent circular dependency import issues by importing dynamically or just setting it here
      // But we can import setLogoutHandler because it's a value, not a type usage that might cycle?
      // Actually imports are hoisted.
      import('./api-client').then(({ setLogoutHandler }) => {
        setLogoutHandler((reason) => AuthManager.instance.logout(reason))
      })
    }
    return AuthManager.instance
  }

  public async logout(reason?: string, redirectUrl?: string): Promise<void> {
    // 1. Idempotency check
    if (this.isLoggingOut) {
      return
    }
    this.isLoggingOut = true
    
    if (reason) {
      console.log(`[AuthManager] Logout initiated: ${reason}`)
    }

    try {
      // 2. Notify backend and give it a brief window to clear HttpOnly session cookie.
      await Promise.race([
        requestHelpers.post(authEndpoints.logout),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ])
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[AuthManager] Backend logout warning:', err)
      }
    }

    // 3. Clear local state (Atomic)
    removeCookie('token')
    useAuthStore.getState().clearAuth()

    // 4. Redirect (full reload clears in-memory state)
    const loginUrl = getAuthLoginUrl()
    if (redirectUrl) {
      window.location.href = `${loginUrl}?redirect=${encodeURIComponent(redirectUrl)}`
    } else {
      // Default to current page as return URL if not specified, 
      // but only if we are not already on the login page? 
      // The user wants clean logout.
      // If triggered by 401, we usually want to return.
      // If triggered by user click, we usually go to login home.
      
      // Let's match the old behavior: if reason is provided (likely 401), we return.
      // If no reason (user click), we just go to login.
      if (reason) {
         window.location.href = `${loginUrl}?reauth=1&redirect=${encodeURIComponent(window.location.href)}`
      } else {
         window.location.href = loginUrl
      }
    }
  }

  public async loadIdentity(force = false): Promise<void> {
    const store = useAuthStore.getState()
    const { token, name } = store

    if (!token) {
      return
    }

    // Optimization: Skip non-forced checks when profile is already known.
    if (!force && name) {
      return
    }

    if (this.isVerifying) return
    this.isVerifying = true

    try {
      const data = await requestHelpers.get<{
        user?: { email?: string; name?: string }
        identity?: { id?: string; name?: string; privacy?: 'public' | 'private' }
      }>(authEndpoints.identity)
      
      if (data.identity) {
        const identityId = data.identity.id ?? ''
        const identityName = data.identity.name ?? ''
        store.setProfile(identityId, identityName)
        mergeProfileCookie({
          email: data.user?.email,
          name: identityName || null,
        })
      } else if (data.user) {
        // Fallback for some auth providers
        const displayName = data.user.name || data.user.email || ''
        store.setProfile('', displayName)
        mergeProfileCookie({
          email: data.user.email,
          name: displayName || null,
        })
      }
    } catch (error) {
      if (requestHelpers.isAuthError(error)) {
        console.warn('[AuthManager] Identity check failed (401) -> Logging out')
        await this.logout('Identity check 401')
      } else {
        console.error('[AuthManager] Identity check error:', error)
      }
    } finally {
      this.isVerifying = false
      // Ensure we mark initialized even on error to stop spinners
      if (!store.isInitialized) {
        // We can't easily access the private set method here without changing the store
        // But since we are friends with the store, we might need to expose a method
        // Or re-trigger initialize
        store.initialize() 
      }
    }
  }
}

export const authManager = AuthManager.getInstance()
