import { CodeTabs } from './CodeTabs'

type PackageManagerTabsProps = {
  package?: string
}

export function PackageManagerTabs({ package: pkg = '@woon-ui/react' }: PackageManagerTabsProps) {
  return (
    <CodeTabs
      tabs={[
        { label: 'npm', lang: 'bash', code: `npm install ${pkg}` },
        { label: 'pnpm', lang: 'bash', code: `pnpm add ${pkg}` },
        { label: 'yarn', lang: 'bash', code: `yarn add ${pkg}` },
        { label: 'bun', lang: 'bash', code: `bun add ${pkg}` },
      ]}
    />
  )
}
