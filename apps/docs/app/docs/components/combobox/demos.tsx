'use client'

import { Combobox } from '@woon-ui/combobox'
import { useMemo, useState } from 'react'

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular' },
  { value: 'qwik', label: 'Qwik' },
]

const LANGUAGES = [
  { value: 'ts', label: 'TypeScript', group: 'frontend' },
  { value: 'js', label: 'JavaScript', group: 'frontend' },
  { value: 'go', label: 'Go', group: 'backend' },
  { value: 'rust', label: 'Rust', group: 'backend' },
  { value: 'python', label: 'Python', group: 'backend' },
]

export function BasicComboboxDemo() {
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      FRAMEWORKS.filter(
        (f) =>
          f.label.toLowerCase().includes(query.toLowerCase()) ||
          f.value.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Combobox.Root
        value={value}
        onValueChange={setValue}
        inputValue={query}
        onInputValueChange={setQuery}
      >
        <Combobox.Input placeholder="프레임워크 검색..." />
        <Combobox.Content>
          {filtered.map((f) => (
            <Combobox.Item key={f.value} value={f.value}>
              {f.label}
            </Combobox.Item>
          ))}
          {filtered.length === 0 && <Combobox.Empty>결과 없음</Combobox.Empty>}
        </Combobox.Content>
      </Combobox.Root>
      {value && <p style={{ fontSize: '0.8125rem', color: '#71717a' }}>선택된 값: {value}</p>}
    </div>
  )
}

export function FreeFormComboboxDemo() {
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => FRAMEWORKS.filter((f) => f.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Combobox.Root
        freeForm
        value={value}
        onValueChange={setValue}
        inputValue={query}
        onInputValueChange={setQuery}
      >
        <Combobox.Input placeholder="직접 입력하거나 선택..." />
        <Combobox.Content>
          {filtered.map((f) => (
            <Combobox.Item key={f.value} value={f.value}>
              {f.label}
            </Combobox.Item>
          ))}
          {filtered.length === 0 && <Combobox.Empty>결과 없음</Combobox.Empty>}
        </Combobox.Content>
      </Combobox.Root>
      {value && <p style={{ fontSize: '0.8125rem', color: '#71717a' }}>값: {value}</p>}
    </div>
  )
}

export function GroupComboboxDemo() {
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')

  const frontend = useMemo(
    () =>
      LANGUAGES.filter(
        (l) => l.group === 'frontend' && l.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  const backend = useMemo(
    () =>
      LANGUAGES.filter(
        (l) => l.group === 'backend' && l.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  const isEmpty = frontend.length === 0 && backend.length === 0

  return (
    <Combobox.Root
      value={value}
      onValueChange={setValue}
      inputValue={query}
      onInputValueChange={setQuery}
    >
      <Combobox.Input placeholder="언어 검색..." />
      <Combobox.Content>
        {isEmpty ? (
          <Combobox.Empty>결과 없음</Combobox.Empty>
        ) : (
          <>
            {frontend.length > 0 && (
              <Combobox.Group>
                <Combobox.Label>프론트엔드</Combobox.Label>
                {frontend.map((l) => (
                  <Combobox.Item key={l.value} value={l.value}>
                    {l.label}
                  </Combobox.Item>
                ))}
              </Combobox.Group>
            )}
            {frontend.length > 0 && backend.length > 0 && <Combobox.Separator />}
            {backend.length > 0 && (
              <Combobox.Group>
                <Combobox.Label>백엔드</Combobox.Label>
                {backend.map((l) => (
                  <Combobox.Item key={l.value} value={l.value}>
                    {l.label}
                  </Combobox.Item>
                ))}
              </Combobox.Group>
            )}
          </>
        )}
      </Combobox.Content>
    </Combobox.Root>
  )
}
