'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navGroups } from './nav-data'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-(--header-height) h-[calc(100dvh-var(--header-height))] overflow-y-auto border-r border-border py-6 max-xl:hidden">
      <nav className="flex flex-col gap-6 px-(--common-container-padding-inline)">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-subtle px-2 mb-1">
              {group.label}
            </p>
            <ul className="flex flex-col gap-px">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-2 py-1.5 text-sm rounded-sm transition-colors ${
                      pathname === item.href
                        ? 'text-text-heading bg-surface font-semibold'
                        : 'text-text-label hover:text-text-body hover:bg-bg-subtle'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
