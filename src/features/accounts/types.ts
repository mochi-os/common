// Connected accounts types for shared components

export interface Account {
  id: number
  type: string
  label: string
  identifier: string
  created: number
  verified: number
}

export interface ProviderField {
  name: string
  label: string
  type: 'email' | 'text' | 'password' | 'url'
  required: boolean
  placeholder: string
}

export interface Provider {
  type: string
  label: string
  capabilities: string[]
  flow: 'form' | 'browser' | 'oauth'
  fields: ProviderField[]
  verify: boolean
}

export interface AccountsHookResult {
  providers: Provider[]
  accounts: Account[]
  isLoading: boolean
  isProvidersLoading: boolean
  isAccountsLoading: boolean
  add: (type: string, fields: Record<string, string>) => Promise<Account>
  remove: (id: number) => Promise<boolean>
  update: (id: number, fields: Record<string, string>) => Promise<boolean>
  verify: (id: number, code?: string) => Promise<boolean>
  refetch: () => void
  isAdding: boolean
  isRemoving: boolean
  isVerifying: boolean
}
