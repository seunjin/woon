export type Framework = 'next-app-router' | 'vite-react' | 'unknown'

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export interface WoonConfig {
  $schema: string
  framework: Framework
  packageManager: PackageManager
  paths: {
    ui: string
    hooks: string
    lib: string
  }
  aliases: Partial<{
    ui: string
    hooks: string
    lib: string
  }>
  style: 'colocated-css'
}

export interface FeatureDefinition {
  name: string
  packageName: string
  exportName: string
  template: 'dialog' | 'toast' | 're-export'
  runtime?: {
    packageName: string
    importName: string
    note: string
  }
}

export type FeatureName =
  | 'dialog'
  | 'toast'
  | 'drawer'
  | 'tooltip'
  | 'popover'
  | 'dropdown-menu'
  | 'context-menu'
  | 'select'
  | 'combobox'
