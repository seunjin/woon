'use client'

import { Popover } from '@woon-ui/popover'
import { Button } from '@/components/ui/Button'

export function BasicPopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button>팝오버 열기</Button>
      </Popover.Trigger>
      <Popover.Content>
        <div style={{ padding: 16, maxWidth: 240 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>팝오버 제목</p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>
            팝오버 내부에 자유로운 콘텐츠를 넣을 수 있습니다.
          </p>
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}

export function PopoverSideDemo() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover.Root key={side}>
          <Popover.Trigger asChild>
            <Button variant="outline">{side}</Button>
          </Popover.Trigger>
          <Popover.Content side={side}>
            <div style={{ padding: 12, fontSize: 13 }}>side=&quot;{side}&quot;</div>
          </Popover.Content>
        </Popover.Root>
      ))}
    </div>
  )
}
