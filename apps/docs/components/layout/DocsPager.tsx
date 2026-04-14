'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type NavItem, navGroups } from './nav-data'

type FlatPage = { label: string; href: string }

function flatten(items: NavItem[], acc: FlatPage[] = []): FlatPage[] {
  for (const item of items) {
    if (item.href) acc.push({ label: item.label, href: item.href })
    if (item.children) flatten(item.children, acc)
  }
  return acc
}

const pages: FlatPage[] = navGroups.flatMap((group) => flatten(group.items))

export function DocsPager() {
  const pathname = usePathname()
  const index = pages.findIndex((p) => p.href === pathname)
  if (index === -1) return null

  const prev = index > 0 ? pages[index - 1] : null
  const next = index < pages.length - 1 ? pages[index + 1] : null

  if (!prev && !next) return null

  return (
    <nav
      className={`docs-pager ${!prev || !next ? 'docs-pager--single' : ''}`}
      aria-label="페이지 네비게이션"
    >
      {prev && (
        <Link href={prev.href} className="docs-pager-link docs-pager-link--prev">
          <span className="docs-pager-label">← 이전</span>
          <span className="docs-pager-title">{prev.label}</span>
        </Link>
      )}
      {next && (
        <Link href={next.href} className="docs-pager-link docs-pager-link--next">
          <span className="docs-pager-label">다음 →</span>
          <span className="docs-pager-title">{next.label}</span>
        </Link>
      )}
    </nav>
  )
}
