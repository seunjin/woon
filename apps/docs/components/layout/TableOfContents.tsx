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
    <aside className="toc">
      <p className="toc-label">On this page</p>
      <nav>
        <ul className="toc-list">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`toc-link depth-${item.depth}${active === item.id ? ' is-active' : ''}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <style>{`
        .toc {
          position: fixed;
          top: var(--header-height);
          right: 0;
          width: var(--toc-width);
          height: calc(100vh - var(--header-height));
          overflow-y: auto;
          padding: 1.75rem 1rem 1.75rem 0.5rem;
        }
        .toc-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-text-subtle);
          margin-bottom: 0.75rem;
          padding: 0 0.5rem;
        }
        .toc-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .toc-link {
          display: block;
          padding: 0.25rem 0.5rem;
          font-size: 0.8125rem;
          color: var(--color-text-subtle);
          border-radius: var(--radius-sm);
          transition: color 0.15s;
          line-height: 1.5;
        }
        .toc-link.depth-3 {
          padding-left: 1rem;
        }
        .toc-link:hover {
          color: var(--color-text-label);
        }
        .toc-link.is-active {
          color: var(--color-text);
          font-weight: 600;
        }

        @media (max-width: 1280px) {
          .toc {
            display: none;
          }
        }
      `}</style>
    </aside>
  )
}
