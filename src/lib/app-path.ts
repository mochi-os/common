// Get the app's base path from the current URL
// The app path is the first segment of the pathname (e.g., /wiki, /docs, /notes)
// This allows the app to be mounted at any URL path

// Routes that are class-level (not entity-specific)
// These include common route segments that should not be treated as entity IDs
const CLASS_ROUTES = [
  'new', 'create', 'list', 'info', 'assets', 'images', 'search',
  // Settings app routes
  'user', 'system', 'domains', 'errors',
  // Friends app routes
  'invitations',
  // Wiki app routes
  'join', 'tags', 'changes', 'redirects', 'settings',
]

// Check if a string looks like an entity ID (50-51 chars of base58)
function isEntityId(s: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{50,51}$/.test(s)
}

// Cached values (computed once at startup)
let cachedAppPath: string | null = null
let cachedRouterBasepath: string | null = null
let cachedApiBasepath: string | null = null

// Known app paths - if the first path segment isn't one of these and isn't an entity ID,
// we're likely on a subdomain with entity routing
const KNOWN_APPS = [
  'wikis', 'wiki', 'forums', 'forum', 'feeds', 'feed', 'chat', 'files',
  'login', 'home', 'notifications', 'people', 'friends', 'settings', 'publisher',
  'apps', 'app-market-server',
]

// Check if we're on a domain with entity routing (subdomain or custom domain)
// Returns true if first path segment isn't a known app or entity ID
// This handles both subdomains (docs.mochi-os.org) and custom domains (acunningham.org)
export function isDomainEntityRouting(): boolean {
  const pathname = window.location.pathname
  const match = pathname.match(/^\/([^/]*)/)
  const firstSegment = match ? match[1] : ''

  // If first segment is a known app, it's app routing
  if (KNOWN_APPS.includes(firstSegment)) return false
  // If first segment is an entity ID, it's direct entity routing (handled elsewhere)
  if (isEntityId(firstSegment)) return false

  // Otherwise, we're on a domain-routed entity
  return true
}

// Get the app path (first URL segment, e.g., /wiki)
// For direct entity routing (/<entity>/) or subdomain entity routing, returns empty string
export function getAppPath(): string {
  if (cachedAppPath === null) {
    // Domain entity routing: no app path
    if (isDomainEntityRouting()) {
      cachedAppPath = ''
    } else {
      const pathname = window.location.pathname
      const match = pathname.match(/^\/([^/]+)/)
      if (match && !isEntityId(match[1])) {
        cachedAppPath = '/' + match[1]
      } else {
        cachedAppPath = ''
      }
    }
  }
  return cachedAppPath
}

// Get the router basepath
// Class context: /<app>/ (e.g., /wiki/)
// Entity context: /<app>/<entity-id>/ (e.g., /wiki/abc123/)
// Direct entity: /<entity-id>/ (e.g., /abc123/)
// Subdomain entity: / (e.g., docs.mochi-os.org/)
export function getRouterBasepath(): string {
  if (cachedRouterBasepath === null) {
    // Domain entity routing: basepath is just /
    if (isDomainEntityRouting()) {
      cachedRouterBasepath = '/'
    } else {
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
  }
  return cachedRouterBasepath
}

// Get the API basepath
// Class context: /<app>/ (e.g., /wiki/)
// Entity context: /<app>/<entity-id>/-/ (e.g., /wiki/abc123/-/)
// Direct entity: /<entity-id>/-/ (e.g., /abc123/-/)
// Subdomain entity: /-/ (e.g., docs.mochi-os.org/-/)
export function getApiBasepath(): string {
  if (cachedApiBasepath === null) {
    // Domain entity routing: API calls go to /-/
    if (isDomainEntityRouting()) {
      cachedApiBasepath = '/-/'
    } else {
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
