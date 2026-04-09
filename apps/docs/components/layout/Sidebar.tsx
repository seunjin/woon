'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {nav.map((group) => (
          <div key={group.label} className="sidebar-group">
            <p className="sidebar-group-label">{group.label}</p>
            <ul className="sidebar-list">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar-link${pathname === item.href ? ' is-active' : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <style>{`
        .sidebar {
          position: fixed;
          top: var(--header-height);
          left: 0;
          width: var(--sidebar-width);
          height: calc(100vh - var(--header-height));
          overflow-y: auto;
          border-right: 1px solid var(--color-border);
          padding: 1.5rem 0;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 0 0.75rem;
        }
        .sidebar-group-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-text-subtle);
          padding: 0 0.5rem;
          margin-bottom: 0.25rem;
        }
        .sidebar-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .sidebar-link {
          display: block;
          padding: 0.375rem 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-label);
          border-radius: var(--radius-sm);
          transition: color 0.15s, background 0.15s;
        }
        .sidebar-link:hover {
          color: var(--color-text);
          background: var(--color-bg-subtle);
        }
        .sidebar-link.is-active {
          color: var(--color-text-heading);
          background: var(--color-surface);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  )
}
