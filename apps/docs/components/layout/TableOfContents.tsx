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
        // 페이지 바닥 근처면 scroll handler가 마지막 항목을 고정 — IO 결과로 덮어쓰지 않음
        const atBottom =
          window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8
        if (atBottom) return

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

    // rootMargin 때문에 마지막 섹션은 교차 영역에 못 들어오므로
    // 스크롤이 바닥 근처면 마지막 toc 항목을 강제로 활성화
    const onScroll = () => {
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8
      if (atBottom && items.length > 0) {
        setActive(items[items.length - 1].id)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [items])

  if (items.length === 0) return null

  return (
    <aside
      className="sticky top-(--header-height) h-[calc(100dvh-var(--header-height))] overflow-y-auto pt-10 pb-7 px-(--common-container-padding-inline) max-xl:hidden  bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_oklab,var(--color-border)_12%,transparent)_10%,var(--color-border)_30%,var(--color-border)_70%,color-mix(in_oklab,var(--color-border)_12%,transparent)_90%,transparent_100%)]
  bg-size-[1px_100%]
  bg-no-repeat
  bg-top-left"
    >
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
