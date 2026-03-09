// Shell bridge: communication between sandboxed iframe apps and the shell page.
// When an app runs inside the shell's sandboxed iframe, it has an opaque origin
// and cannot access cookies, localStorage, or the parent DOM. All communication
// happens via postMessage.

type ShellInitData = {
  token: string
  theme?: string
  user: { name: string }
  inShell: boolean
}

type ShellMessage = {
  type: string
  [key: string]: unknown
}

let shellInitData: ShellInitData | null = null
let shellInitPromise: Promise<ShellInitData> | null = null
let messageListeners: Array<(msg: ShellMessage) => void> = []

/** Check if the app is running inside the shell's sandboxed iframe */
export function isInShell(): boolean {
  if (typeof window === 'undefined') return false

  // Fast path: already detected
  if (shellInitData !== null) return true

  // Check if we're in a cross-origin iframe by trying to access parent document
  try {
    if (window.parent === window) return false
    // This will throw SecurityError for sandboxed iframes (opaque origin)
    void window.parent.document
    return false // Same origin — not sandboxed
  } catch {
    return true // SecurityError — we're in a sandboxed iframe
  }
}

/** Initialize the shell bridge. Sends 'ready' and waits for 'init' from shell. */
export function initShellBridge(): Promise<ShellInitData> {
  if (shellInitPromise) return shellInitPromise

  if (!isInShell()) {
    return Promise.resolve({
      token: '',
      user: { name: '' },
      inShell: false,
    })
  }

  shellInitPromise = new Promise((resolve) => {
    function onMessage(event: MessageEvent) {
      const data = event.data
      if (!data || typeof data !== 'object') return

      if (data.type === 'init') {
        window.removeEventListener('message', onMessage)
        shellInitData = data as ShellInitData
        resolve(shellInitData)
      }
    }

    window.addEventListener('message', onMessage)

    // Tell the shell we're ready
    window.parent.postMessage({ type: 'ready' }, '*')
  })

  return shellInitPromise
}

/** Get the cached init data (null if not yet initialized) */
export function getShellInitData(): ShellInitData | null {
  return shellInitData
}

/** Send a navigation event to the shell (intra-app) */
export function shellNavigate(path: string): void {
  if (!isInShell()) {
    window.location.href = path
    return
  }
  window.parent.postMessage({ type: 'navigate', path }, '*')
}

/** Send a cross-app navigation event to the shell */
export function shellNavigateExternal(url: string): void {
  if (!isInShell()) {
    window.location.href = url
    return
  }
  window.parent.postMessage({ type: 'navigate-external', url }, '*')
}

/** Update the document title (syncs to shell) */
export function shellSetTitle(title: string): void {
  document.title = title
  if (isInShell()) {
    window.parent.postMessage({ type: 'title', title }, '*')
  }
}

/** Listen for messages from the shell */
export function onShellMessage(listener: (msg: ShellMessage) => void): () => void {
  messageListeners.push(listener)

  return () => {
    messageListeners = messageListeners.filter((l) => l !== listener)
  }
}

// Global message listener — routes shell messages to registered listeners
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data
    if (!data || typeof data !== 'object' || !data.type) return

    // Handle token refresh
    if (data.type === 'token-refresh' && shellInitData) {
      shellInitData.token = data.token as string
    }

    // Route to all registered listeners
    for (const listener of messageListeners) {
      listener(data as ShellMessage)
    }
  })
}
