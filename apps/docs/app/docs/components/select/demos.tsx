'use client'

import { Select } from '@woon-ui/select'
import { useState } from 'react'

export function BasicSelectDemo() {
  const [value, setValue] = useState('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="프레임워크 선택" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="react">React</Select.Item>
          <Select.Item value="vue">Vue</Select.Item>
          <Select.Item value="svelte">Svelte</Select.Item>
          <Select.Item value="solid">Solid</Select.Item>
        </Select.Content>
      </Select.Root>
      {value && <p style={{ fontSize: '0.8125rem', color: '#71717a' }}>선택된 값: {value}</p>}
    </div>
  )
}

export function GroupSelectDemo() {
  const [value, setValue] = useState('')
  return (
    <Select.Root value={value} onValueChange={setValue}>
      <Select.Trigger>
        <Select.Value placeholder="언어 선택" />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>프론트엔드</Select.Label>
          <Select.Item value="ts">TypeScript</Select.Item>
          <Select.Item value="js">JavaScript</Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.Label>백엔드</Select.Label>
          <Select.Item value="go">Go</Select.Item>
          <Select.Item value="rust">Rust</Select.Item>
          <Select.Item value="python" disabled>
            Python (준비 중)
          </Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  )
}

export function DisabledSelectDemo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Select.Root defaultValue="react" disabled>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="react">React</Select.Item>
        </Select.Content>
      </Select.Root>
      <span style={{ fontSize: '0.8125rem', color: '#71717a', alignSelf: 'center' }}>
        disabled trigger
      </span>
    </div>
  )
}
