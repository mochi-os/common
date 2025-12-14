// Get the app's base path from the current URL
// The app path is the first segment of the pathname (e.g., /wiki, /docs, /notes)
// This allows the app to be mounted at any URL path

// Routes that are class-level (not entity-specific)
const CLASS_ROUTES = ['new', 'create', 'info', 'assets', 'images']

// Check if a string looks like an entity ID (50-51 chars of base58)
function isEntityId(s: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{50,51}$/.test(s)
}

// Cached values (computed once at startup)
let cachedAppPath: string | null = null
let cachedRouterBasepath: string | null = null
let cachedApiBasepath: string | null = null

// Get the app path (first URL segment, e.g., /wiki)
// For direct entity routing (/<entity>/), returns empty string
export function getAppPath(): string {
  if (cachedAppPath === null) {
    const pathname = window.location.pathname
    const match = pathname.match(/^\/([^/]+)/)
    if (match && !isEntityId(match[1])) {
      cachedAppPath = '/' + match[1]
    } else {
      cachedAppPath = ''
    }
  }
  return cachedAppPath
}

// Get the router basepath
// Class context: /<app>/ (e.g., /wiki/)
// Entity context: /<app>/<entity-id>/ (e.g., /wiki/abc123/)
// Direct entity: /<entity-id>/ (e.g., /abc123/)
export function getRouterBasepath(): string {
  if (cachedRouterBasepath === null) {
    const pathname = window.location.pathname
    // Check for direct entity routing: /<entity>/
    const directMatch = pathname.match(/^\/([^/]+)/)
    if (directMatch && isEntityId(directMatch[1])) {
      cachedRouterBasepath = `/${directMatch[1]}/`
    } else {
      // Check for /<app>/<entity>/ pattern
      const match = pathname.match(/^(\/[^/]+)\/([^/]+)/)
      if (match && !CLASS_ROUTES.includes(match[2])) {
        cachedRouterBasepath = `${match[1]}/${match[2]}/`
      } else {
        cachedRouterBasepath = getAppPath() + '/'
      }
    }
  }
  return cachedRouterBasepath
}

// Get the API basepath
// Class context: /<app>/ (e.g., /wiki/)
// Entity context: /<app>/<entity-id>/-/ (e.g., /wiki/abc123/-/)
// Direct entity: /<entity-id>/-/ (e.g., /abc123/-/)
export function getApiBasepath(): string {
  if (cachedApiBasepath === null) {
    const pathname = window.location.pathname
    // Check for direct entity routing: /<entity>/
    const directMatch = pathname.match(/^\/([^/]+)/)
    if (directMatch && isEntityId(directMatch[1])) {
      cachedApiBasepath = `/${directMatch[1]}/-/`
    } else {
      // Check for /<app>/<entity>/ pattern
      const match = pathname.match(/^(\/[^/]+)\/([^/]+)/)
      if (match && !CLASS_ROUTES.includes(match[2])) {
        cachedApiBasepath = `${match[1]}/${match[2]}/-/`
      } else {
        cachedApiBasepath = getAppPath() + '/'
      }
    }
  }
  return cachedApiBasepath
}

// Get the auth login URL from environment or default
export function getAuthLoginUrl(): string {
  return (
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_AUTH_LOGIN_URL) ||
    '/'
  )
}
