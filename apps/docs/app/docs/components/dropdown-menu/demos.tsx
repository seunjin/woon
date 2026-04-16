'use client'

import { DropdownMenu } from '@woon/core/dropdown-menu'
import { Button } from '@/components/ui/Button'

export function BasicDropdownMenuDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button>계정 메뉴</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>계정</DropdownMenu.Label>
        <DropdownMenu.Item onSelect={() => alert('프로필')}>프로필</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => alert('설정')}>설정</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={() => alert('로그아웃')}>로그아웃</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function DisabledItemDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button>파일</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={() => alert('새 파일')}>새 파일</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => alert('열기')}>열기</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item disabled>저장 (비활성)</DropdownMenu.Item>
        <DropdownMenu.Item disabled>다른 이름으로 저장 (비활성)</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function GroupDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button>편집</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Label>클립보드</DropdownMenu.Label>
          <DropdownMenu.Item onSelect={() => alert('잘라내기')}>잘라내기</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => alert('복사')}>복사</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => alert('붙여넣기')}>붙여넣기</DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Label>선택</DropdownMenu.Label>
          <DropdownMenu.Item onSelect={() => alert('전체 선택')}>전체 선택</DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function SideDemo() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['bottom', 'top', 'right', 'left'] as const).map((side) => (
        <DropdownMenu.Root key={side} side={side}>
          <DropdownMenu.Trigger asChild>
            <Button variant="outline">{side}</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>항목 1</DropdownMenu.Item>
            <DropdownMenu.Item>항목 2</DropdownMenu.Item>
            <DropdownMenu.Item>항목 3</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ))}
    </div>
  )
}
