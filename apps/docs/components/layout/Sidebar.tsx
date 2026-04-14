'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from './nav-data'
import { navGroups } from './nav-data'

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  const hasActiveChild = item.children?.some((c) => pathname === c.href) ?? false

  return (
    <li>
      <Link
        href={item.href}
        className={`block py-1.5 text-sm rounded-sm transition-colors ${
          depth > 0 ? 'pl-6 pr-2' : 'px-2'
        } ${
          isActive
            ? 'text-text-heading bg-surface font-semibold'
            : hasActiveChild
              ? 'text-text-body'
              : 'text-text-label hover:text-text-body hover:bg-bg-subtle'
        }`}
      >
        {item.label}
      </Link>
      {item.children && item.children.length > 0 && (
        <ul className="flex flex-col gap-px">
          {item.children.map((child) => (
            <NavLink key={child.href} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function Sidebar() {
  return (
    <aside
      className="
  sticky top-(--header-height)
  h-[calc(100dvh-var(--header-height))]
  overflow-y-auto py-6 max-xl:hidden
  bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_oklab,var(--color-border)_12%,transparent)_10%,var(--color-border)_30%,var(--color-border)_70%,color-mix(in_oklab,var(--color-border)_12%,transparent)_90%,transparent_100%)]
  bg-size-[1px_100%]
  bg-no-repeat
  bg-top-right
"
    >
      <nav className="flex flex-col gap-6 px-(--common-container-padding-inline)">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-subtle px-2 mb-1">
              {group.label}
            </p>
            <ul className="flex flex-col gap-px">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
