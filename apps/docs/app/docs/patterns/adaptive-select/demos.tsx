'use client'

import { BottomSheet } from '@woon-ui/bottom-sheet'
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const selectedLabel = ITEMS.find((i) => i.value === value)?.label

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
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

        <BottomSheet.Root open={sheetOpen} onOpenChange={setSheetOpen} snapPoints={[0.45]}>
          <BottomSheet.Content>
            <BottomSheet.Handle />
            <div style={{ padding: '0 1.5rem 0.75rem' }}>
              <BottomSheet.Title style={{ fontSize: '1rem', fontWeight: 600 }}>
                프레임워크 선택
              </BottomSheet.Title>
            </div>
            <div data-woon-bottom-sheet-body>
              {ITEMS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setValue(item.value)
                    setSheetOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '14px 1.5rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.9375rem',
                    color: '#18181b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderBottom: '1px solid #f4f4f5',
                  }}
                >
                  {item.label}
                  {value === item.value && (
                    <span style={{ color: '#6366f1', fontWeight: 600 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </BottomSheet.Content>
        </BottomSheet.Root>

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
  const [sheetOpen, setSheetOpen] = useState(false)
  const isCoarse = usePointerCoarse()

  const selectedLabel = ITEMS.find((i) => i.value === value)?.label

  if (isCoarse) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
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

        <BottomSheet.Root open={sheetOpen} onOpenChange={setSheetOpen} snapPoints={[0.45]}>
          <BottomSheet.Content>
            <BottomSheet.Handle />
            <div style={{ padding: '0 1.5rem 0.75rem' }}>
              <BottomSheet.Title style={{ fontSize: '1rem', fontWeight: 600 }}>
                프레임워크 선택
              </BottomSheet.Title>
            </div>
            <div data-woon-bottom-sheet-body>
              {ITEMS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setValue(item.value)
                    setSheetOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '14px 1.5rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.9375rem',
                    color: '#18181b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderBottom: '1px solid #f4f4f5',
                  }}
                >
                  {item.label}
                  {value === item.value && (
                    <span style={{ color: '#6366f1', fontWeight: 600 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </BottomSheet.Content>
        </BottomSheet.Root>

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
