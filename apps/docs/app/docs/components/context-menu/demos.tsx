'use client'

import { ContextMenu } from '@woon/core/context-menu'

const triggerStyle: React.CSSProperties = {
  padding: '3rem 2rem',
  border: '2px dashed #e4e4e7',
  borderRadius: 8,
  color: '#71717a',
  userSelect: 'none',
  textAlign: 'center',
  fontSize: '0.875rem',
}

export function BasicContextMenuDemo() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div style={triggerStyle}>우클릭 하세요</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label>편집</ContextMenu.Label>
        <ContextMenu.Item onSelect={() => alert('복사')}>복사</ContextMenu.Item>
        <ContextMenu.Item onSelect={() => alert('붙여넣기')}>붙여넣기</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item onSelect={() => alert('삭제')}>삭제</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

export function DisabledItemDemo() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div style={triggerStyle}>우클릭 하세요 (비활성 항목 포함)</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={() => alert('새 파일')}>새 파일</ContextMenu.Item>
        <ContextMenu.Item onSelect={() => alert('열기')}>열기</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item disabled>저장 (비활성)</ContextMenu.Item>
        <ContextMenu.Item disabled>다른 이름으로 저장 (비활성)</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

export function GroupDemo() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div style={triggerStyle}>우클릭 하세요 (그룹 메뉴)</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Group>
          <ContextMenu.Label>클립보드</ContextMenu.Label>
          <ContextMenu.Item onSelect={() => alert('잘라내기')}>잘라내기</ContextMenu.Item>
          <ContextMenu.Item onSelect={() => alert('복사')}>복사</ContextMenu.Item>
          <ContextMenu.Item onSelect={() => alert('붙여넣기')}>붙여넣기</ContextMenu.Item>
        </ContextMenu.Group>
        <ContextMenu.Separator />
        <ContextMenu.Group>
          <ContextMenu.Label>선택</ContextMenu.Label>
          <ContextMenu.Item onSelect={() => alert('전체 선택')}>전체 선택</ContextMenu.Item>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
