'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

type PagefindSubResult = {
  title: string
  url: string
  excerpt: string
}

type PagefindResult = {
  url: string
  meta: { title?: string; image?: string }
  excerpt: string
  sub_results: PagefindSubResult[]
}

type PagefindInstance = {
  search: (query: string) => Promise<{ results: Array<{ data: () => Promise<PagefindResult> }> }>
}

type FlatResult = {
  title: string
  url: string
  excerpt: string
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FlatResult[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [pagefind, setPagefind] = useState<PagefindInstance | null>(null)
  const [pfError, setPfError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load pagefind once
  useEffect(() => {
    let cancelled = false
    async function loadPagefind() {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: pagefind is a runtime-loaded module with no types
        const pf = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js' as any)
        if (!cancelled) setPagefind(pf as PagefindInstance)
      } catch {
        if (!cancelled) setPfError(true)
      }
    }
    loadPagefind()
    return () => {
      cancelled = true
    }
  }, [])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  // Scroll active item into view — dep array 없음: activeIndex 변화마다 실행
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector('[data-active="true"]')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  })

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || !pagefind) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const searchObj = await pagefind.search(query)
        const dataList: PagefindResult[] = await Promise.all(
          searchObj.results.slice(0, 8).map((r) => r.data()),
        )
        const flat: FlatResult[] = dataList.flatMap((page) => {
          if (page.sub_results && page.sub_results.length > 0) {
            return page.sub_results.map((sub) => ({
              title: sub.title,
              url: sub.url,
              excerpt: sub.excerpt,
            }))
          }
          return [
            {
              title: page.meta?.title ?? page.url,
              url: page.url,
              excerpt: page.excerpt,
            },
          ]
        })
        setResults(flat)
        setActiveIndex(0)
      } catch {
        setResults([])
        setActiveIndex(0)
      }
    }, 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, pagefind])

  function handleSelect(url: string) {
    router.push(url)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (results[activeIndex]) {
        handleSelect(results[activeIndex].url)
      }
    }
  }

  if (!open) return null

  function renderBody() {
    if (!query.trim()) {
      if (pfError) {
        return (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              fontSize: 14,
              color: 'var(--color-text-subtle)',
            }}
          >
            검색하려면 먼저 build가 필요합니다
          </div>
        )
      }
      return (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--color-text-subtle)',
          }}
        >
          검색어를 입력하세요
        </div>
      )
    }
    if (results.length === 0) {
      return (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--color-text-subtle)',
          }}
        >
          결과가 없습니다
        </div>
      )
    }
    return results.map((item) => (
      <SearchItem
        key={item.url}
        item={item}
        isActive={results.indexOf(item) === activeIndex}
        onMouseEnter={() => setActiveIndex(results.indexOf(item))}
        onClick={() => handleSelect(item.url)}
      />
    ))
  }

  return (
    <>
      <style>{`
        mark {
          background: var(--color-accent-subtle);
          color: var(--color-accent);
          border-radius: 2px;
          padding: 0 2px;
        }
      `}</style>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: overlay backdrop dismissal */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop dismissal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 500,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '20vh',
          alignItems: 'flex-start',
        }}
        onClick={onClose}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: keyboard nav handled by input onKeyDown */}
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            margin: '0 16px',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              style={{ flexShrink: 0, color: 'var(--color-text-subtle)' }}
            >
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 10L13.5 13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 15,
                color: 'var(--color-text-body)',
                caretColor: 'var(--color-accent)',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-subtle)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="검색어 지우기"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2 2L12 12M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Results */}
          <div ref={listRef} style={{ maxHeight: 400, overflowY: 'auto' }}>
            {renderBody()}
          </div>
        </div>
      </div>
    </>
  )
}

function SearchItem({
  item,
  isActive,
  onMouseEnter,
  onClick,
}: {
  item: FlatResult
  isActive: boolean
  onMouseEnter: () => void
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-active={isActive}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 16px',
        background: isActive ? 'var(--color-bg-subtle)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-body)' }}>
        {item.title}
      </div>
      <div
        style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 2 }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: pagefind excerpt contains safe <mark> tags
        dangerouslySetInnerHTML={{ __html: item.excerpt }}
      />
    </button>
  )
}
