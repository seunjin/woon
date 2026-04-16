import { CodeTabs } from './CodeTabs'

export function PackageManagerTabs() {
  return (
    <CodeTabs
      tabs={[
        { label: 'npm', lang: 'bash', code: 'npm install @woon-ui/react' },
        { label: 'pnpm', lang: 'bash', code: 'pnpm add @woon-ui/react' },
        { label: 'yarn', lang: 'bash', code: 'yarn add @woon-ui/react' },
        { label: 'bun', lang: 'bash', code: 'bun add @woon-ui/react' },
      ]}
    />
  )
}
