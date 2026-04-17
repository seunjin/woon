'use client'

import { useEffect, useState } from 'react'
import { SearchModal } from './SearchModal'

export function SearchTrigger() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: 200,
          height: 32,
          padding: '0 10px',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 13,
          color: 'var(--color-text-subtle)',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-text-label)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
        aria-label="검색 열기 (⌘K)"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 10L13.5 13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span style={{ flex: 1 }}>Search...</span>
        <kbd
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            padding: '1px 5px',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            fontSize: 11,
            lineHeight: '16px',
            color: 'var(--color-text-subtle)',
            background: 'var(--color-bg-subtle)',
            fontFamily: 'inherit',
          }}
        >
          ⌘K
        </kbd>
      </button>

      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
