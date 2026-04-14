import { CodeTabs } from './CodeTabs'

export function PackageManagerTabs() {
  return (
    <CodeTabs
      tabs={[
        { label: 'npm', lang: 'bash', code: 'npm install @woon/core' },
        { label: 'pnpm', lang: 'bash', code: 'pnpm add @woon/core' },
        { label: 'yarn', lang: 'bash', code: 'yarn add @woon/core' },
        { label: 'bun', lang: 'bash', code: 'bun add @woon/core' },
      ]}
    />
  )
}
