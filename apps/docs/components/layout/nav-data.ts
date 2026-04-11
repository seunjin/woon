export type NavItem = {
  label: string
  href: string
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
      { label: 'Dialog', href: '/docs/components/dialog' },
      { label: 'Toast', href: '/docs/components/toast' },
      { label: 'Popover', href: '/docs/components/popover' },
      { label: 'Tooltip', href: '/docs/components/tooltip' },
    ],
  },
]
