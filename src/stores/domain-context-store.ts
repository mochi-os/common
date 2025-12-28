import { create } from 'zustand'

interface EntityContext {
  id: string
  fingerprint: string
  class: string
}

interface DomainContextState {
  entity: EntityContext | null
  isInitialized: boolean
  initialize: () => Promise<void>
}

export const useDomainContextStore = create<DomainContextState>()((set, get) => ({
  entity: null,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return

    try {
      const response = await fetch('/_/context')
      if (response.ok) {
        const data = await response.json()
        set({
          entity: data.entity ?? null,
          isInitialized: true,
        })
      } else {
        set({ isInitialized: true })
      }
    } catch {
      // Context endpoint not available or failed - that's fine
      set({ isInitialized: true })
    }
  },
}))

// Helper to get entity fingerprint if in domain entity routing
export function getDomainEntityFingerprint(): string | null {
  return useDomainContextStore.getState().entity?.fingerprint ?? null
}

// Helper to check if we're in domain entity context for a specific class
export function isDomainEntityContext(entityClass?: string): boolean {
  const entity = useDomainContextStore.getState().entity
  if (!entity) return false
  if (entityClass && entity.class !== entityClass) return false
  return true
}
