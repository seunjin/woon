'use client'

import { Drawer } from '@woon-ui/drawer'
import { useDialog } from '@woon-ui/react'
import { Select } from '@woon-ui/select'
import { useEffect, useState } from 'react'

// ─── useMediaQuery ────────────────────────────────────────────────────────────

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

// ─── usePointerCoarse ─────────────────────────────────────────────────────────

function usePointerCoarse() {
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)')
    setCoarse(mql.matches)
    const handler = (e: MediaQueryListEvent) => setCoarse(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return coarse
}

const ITEMS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular' },
]

// ─── Breakpoint 기준 ──────────────────────────────────────────────────────────

export function BreakpointAdaptiveSelectDemo() {
  const [value, setValue] = useState('')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const dialog = useDialog()

  const selectedLabel = ITEMS.find((i) => i.value === value)?.label

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={() =>
            dialog.open(({ close }) => (
              <Drawer.Root direction="bottom" size="min(72dvh, 24rem)">
                <Drawer.Overlay />
                <Drawer.Content>
                  <Drawer.Title>프레임워크 선택</Drawer.Title>
                  <Drawer.Description>
                    모바일에서는 popover 대신 bottom drawer surface를 사용할 수 있습니다.
                  </Drawer.Description>
                  <div style={{ display: 'grid', gap: 6, overflowY: 'auto', minHeight: 0 }}>
                    {ITEMS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setValue(item.value)
                          close()
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '14px 1rem',
                          background: 'none',
                          border: '1px solid #f4f4f5',
                          borderRadius: 12,
                          fontSize: '0.9375rem',
                          color: '#18181b',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {item.label}
                        {value === item.value && (
                          <span style={{ color: '#6366f1', fontWeight: 600 }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </Drawer.Content>
              </Drawer.Root>
            ))
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            height: 36,
            borderRadius: 6,
            border: '1px solid #e4e4e7',
            background: '#fff',
            fontSize: '0.875rem',
            color: selectedLabel ? '#18181b' : '#a1a1aa',
            cursor: 'pointer',
            minWidth: 200,
          }}
        >
          {selectedLabel ?? '프레임워크 선택'}
          <span style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>▾</span>
        </button>

        {value && <p style={{ fontSize: '0.8125rem', color: '#71717a' }}>선택된 값: {value}</p>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="프레임워크 선택" />
        </Select.Trigger>
        <Select.Content>
          {ITEMS.map((item) => (
            <Select.Item key={item.value} value={item.value}>
              {item.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      {value && <p style={{ fontSize: '0.8125rem', color: '#71717a' }}>선택된 값: {value}</p>}
    </div>
  )
}

// ─── Pointer 기준 ─────────────────────────────────────────────────────────────

export function PointerAdaptiveSelectDemo() {
  const [value, setValue] = useState('')
  const isCoarse = usePointerCoarse()
  const dialog = useDialog()

  const selectedLabel = ITEMS.find((i) => i.value === value)?.label

  if (isCoarse) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={() =>
            dialog.open(({ close }) => (
              <Drawer.Root direction="bottom" size="min(72dvh, 24rem)">
                <Drawer.Overlay />
                <Drawer.Content>
                  <Drawer.Title>프레임워크 선택</Drawer.Title>
                  <Drawer.Description>
                    coarse pointer 환경에서는 bottom drawer가 더 자연스럽습니다.
                  </Drawer.Description>
                  <div style={{ display: 'grid', gap: 6, overflowY: 'auto', minHeight: 0 }}>
                    {ITEMS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setValue(item.value)
                          close()
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '14px 1rem',
                          background: 'none',
                          border: '1px solid #f4f4f5',
                          borderRadius: 12,
                          fontSize: '0.9375rem',
                          color: '#18181b',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {item.label}
                        {value === item.value && (
                          <span style={{ color: '#6366f1', fontWeight: 600 }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </Drawer.Content>
              </Drawer.Root>
            ))
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            height: 36,
            borderRadius: 6,
            border: '1px solid #e4e4e7',
            background: '#fff',
            fontSize: '0.875rem',
            color: selectedLabel ? '#18181b' : '#a1a1aa',
            cursor: 'pointer',
            minWidth: 200,
          }}
        >
          {selectedLabel ?? '프레임워크 선택'}
          <span style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>▾</span>
        </button>

        {value && <p style={{ fontSize: '0.8125rem', color: '#71717a' }}>선택된 값: {value}</p>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="프레임워크 선택" />
        </Select.Trigger>
        <Select.Content>
          {ITEMS.map((item) => (
            <Select.Item key={item.value} value={item.value}>
              {item.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      {value && <p style={{ fontSize: '0.8125rem', color: '#71717a' }}>선택된 값: {value}</p>}
    </div>
  )
}
