export type Framework = 'next-app-router' | 'vite-react' | 'unknown'

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export interface WoonConfig {
  $schema: string
  framework: Framework
  packageManager: PackageManager
  paths: {
    overlay: string
  }
  adapters: {
    overlay: 'base-ui'
  }
}
