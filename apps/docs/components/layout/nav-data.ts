export type NavItem = {
  label: string
  href: string
  children?: NavItem[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export function normalizeDocsPath(path: string): string {
  if (!path) return '/'

  const normalized = path.replace(/\/+$/, '')
  return normalized === '' ? '/' : normalized
}

export const navGroups: NavGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Installation', href: '/docs/installation' },
      { label: 'Runtime Setup', href: '/docs/runtime-setup' },
    ],
  },
  {
    label: 'Dialog',
    items: [
      {
        label: 'Dialog',
        href: '/docs/components/dialog',
        children: [
          { label: 'Alert', href: '/docs/components/dialog/alert' },
          { label: 'Confirm', href: '/docs/components/dialog/confirm' },
        ],
      },
      { label: 'Drawer', href: '/docs/components/drawer' },
    ],
  },
  {
    label: 'Toast',
    items: [{ label: 'Toast', href: '/docs/components/toast' }],
  },
  {
    label: 'Floating',
    items: [
      { label: 'Tooltip', href: '/docs/components/tooltip' },
      { label: 'Popover', href: '/docs/components/popover' },
      { label: 'Dropdown Menu', href: '/docs/components/dropdown-menu' },
      { label: 'Context Menu', href: '/docs/components/context-menu' },
      { label: 'Select', href: '/docs/components/select' },
      { label: 'Combobox', href: '/docs/components/combobox' },
    ],
  },
  {
    label: 'Patterns',
    items: [{ label: 'Adaptive Select', href: '/docs/patterns/adaptive-select' }],
  },
]
