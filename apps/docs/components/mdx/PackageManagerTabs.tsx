import { CodeTabs } from './CodeTabs'

type PackageManagerTabsProps = {
  package?: string
  packages?: string[]
}

export function PackageManagerTabs({
  package: pkg = '@woon-ui/dialog',
  packages,
}: PackageManagerTabsProps) {
  const installTarget = packages?.join(' ') ?? pkg

  return (
    <CodeTabs
      tabs={[
        { label: 'npm', lang: 'bash', code: `npm install ${installTarget}` },
        { label: 'pnpm', lang: 'bash', code: `pnpm add ${installTarget}` },
        { label: 'yarn', lang: 'bash', code: `yarn add ${installTarget}` },
        { label: 'bun', lang: 'bash', code: `bun add ${installTarget}` },
      ]}
    />
  )
}
