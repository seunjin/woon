export type NavItem = {
  label: string
  href: string
  children?: NavItem[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Installation', href: '/docs/installation' },
    ],
  },
  {
    label: 'Overlay',
    items: [
      { label: 'Provider', href: '/docs/provider' },
      {
        label: 'Dialog',
        href: '/docs/components/dialog',
        children: [
          { label: 'Alert', href: '/docs/components/dialog/alert' },
          { label: 'Confirm', href: '/docs/components/dialog/confirm' },
        ],
      },
      { label: 'Toast', href: '/docs/components/toast' },
      { label: 'Bottom Sheet', href: '/docs/components/bottom-sheet' },
    ],
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
