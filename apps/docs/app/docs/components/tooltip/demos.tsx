'use client'

import { Tooltip } from '@woon/core/tooltip'

export function BasicTooltipDemo() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button type="button" className="demo-button">
          hover me
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content>기본 툴팁</Tooltip.Content>
    </Tooltip.Root>
  )
}

export function ArrowTooltipDemo() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button type="button" className="demo-button">
          화살표 툴팁
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        화살표가 있는 툴팁
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Root>
  )
}

export function TooltipSideDemo() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip.Root key={side} side={side}>
          <Tooltip.Trigger asChild>
            <button type="button" className="demo-button">
              {side}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            side=&quot;{side}&quot;
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Root>
      ))}
    </div>
  )
}

export function DelayTooltipDemo() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Tooltip.Root delay={0}>
        <Tooltip.Trigger asChild>
          <button type="button" className="demo-button">
            즉시 (0ms)
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content>딜레이 없음</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root delay={1000}>
        <Tooltip.Trigger asChild>
          <button type="button" className="demo-button">
            느리게 (1s)
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content>1초 딜레이</Tooltip.Content>
      </Tooltip.Root>
    </div>
  )
}

export function CustomArrowDemo() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button type="button" className="demo-button">
          커스텀 화살표
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        둥근 화살표
        <Tooltip.Arrow fill="#333" stroke="#333" tipRadius={2} />
      </Tooltip.Content>
    </Tooltip.Root>
  )
}
