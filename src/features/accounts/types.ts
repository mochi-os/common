// Connected accounts types for shared components

// Provider type to display label mapping
export const PROVIDER_LABELS: Record<string, string> = {
  browser: 'Browser notifications',
  claude: 'Claude',
  email: 'Email',
  mcp: 'MCP server',
  openai: 'OpenAI',
  pushbullet: 'Pushbullet',
  url: 'External URL',
  web: 'Mochi web',
}

// Get display label for a provider type
export function getProviderLabel(type: string): string {
  return PROVIDER_LABELS[type] || type
}

export interface Account {
  id: number
  type: string
  label: string
  identifier: string
  created: number
  verified: number
  enabled: number
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
  capabilities: string[]
  flow: 'form' | 'browser' | 'oauth'
  fields: ProviderField[]
  verify: boolean
}

export interface AccountTestResult {
  success: boolean
  message: string
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
  test: (id: number) => Promise<AccountTestResult>
  refetch: () => void
  isAdding: boolean
  isRemoving: boolean
  isVerifying: boolean
  isTesting: boolean
}
