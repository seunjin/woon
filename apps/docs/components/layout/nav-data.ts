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
      { label: 'Provider', href: '/docs/provider' },
    ],
  },
  {
    label: 'Overlay',
    items: [
      {
        label: 'Dialog',
        href: '/docs/components/dialog',
        children: [
          { label: 'Alert', href: '/docs/components/dialog/alert' },
          { label: 'Confirm', href: '/docs/components/dialog/confirm' },
        ],
      },
      { label: 'Toast', href: '/docs/components/toast' },
      { label: 'Popover', href: '/docs/components/popover' },
      { label: 'Tooltip', href: '/docs/components/tooltip' },
      { label: 'DropdownMenu', href: '/docs/components/dropdown-menu' },
      { label: 'ContextMenu', href: '/docs/components/context-menu' },
    ],
  },
]
