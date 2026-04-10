'use client'

import { useEffect, useState } from 'react'

type TocItem = {
  id: string
  label: string
  depth: 2 | 3
}

type TableOfContentsProps = {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const headings = items.map((item) => document.getElementById(item.id)).filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-20% 0% -70% 0%' },
    )

    for (const el of headings) {
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <aside className="sticky top-(--header-height) h-[calc(100dvh-var(--header-height))] overflow-y-auto pt-10 pb-7 px-(--common-container-padding-inline) max-xl:hidden">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-subtle mb-3">
        On this page
      </p>
      <nav>
        <ul className="flex flex-col gap-px">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block text-[13px] leading-relaxed rounded-sm transition-colors py-1 ${
                  item.depth === 3 ? 'pl-4 pr-2' : ''
                } ${
                  active === item.id
                    ? 'text-text-body font-semibold'
                    : 'text-text-subtle hover:text-text-label'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
