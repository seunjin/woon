'use client'

import { BottomSheet } from '@woon-ui/bottom-sheet'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function BasicBottomSheetDemo() {
  return (
    <BottomSheet.Root>
      <BottomSheet.Trigger asChild>
        <Button>바텀시트 열기</Button>
      </BottomSheet.Trigger>
      <BottomSheet.Content>
        <BottomSheet.Handle />
        <div style={{ padding: '0 1.5rem 2rem' }}>
          <BottomSheet.Title style={{ marginBottom: 8 }}>바텀시트 제목</BottomSheet.Title>
          <BottomSheet.Description style={{ marginBottom: 20 }}>
            핸들을 아래로 드래그하거나 배경을 클릭해 닫을 수 있습니다.
          </BottomSheet.Description>
          <BottomSheet.Close asChild>
            <Button variant="outline">닫기</Button>
          </BottomSheet.Close>
        </div>
      </BottomSheet.Content>
    </BottomSheet.Root>
  )
}

export function SnapPointsDemo() {
  return (
    <BottomSheet.Root snapPoints={[0.4, 0.9]} defaultSnap={0}>
      <BottomSheet.Trigger asChild>
        <Button variant="outline">스냅 포인트</Button>
      </BottomSheet.Trigger>
      <BottomSheet.Content>
        <BottomSheet.Handle />
        <div style={{ padding: '0 1.5rem 2rem' }}>
          <BottomSheet.Title style={{ marginBottom: 8 }}>스냅 포인트</BottomSheet.Title>
          <BottomSheet.Description style={{ marginBottom: 20 }}>
            위로 드래그하면 90%로 확장됩니다. 아래로 드래그하면 40%로 축소하거나 닫힙니다.
          </BottomSheet.Description>
          <BottomSheet.Close asChild>
            <Button variant="outline">닫기</Button>
          </BottomSheet.Close>
        </div>
      </BottomSheet.Content>
    </BottomSheet.Root>
  )
}

export function ScrollableContentDemo() {
  return (
    <BottomSheet.Root snapPoints={[0.65]}>
      <BottomSheet.Trigger asChild>
        <Button variant="outline">스크롤 목록</Button>
      </BottomSheet.Trigger>
      <BottomSheet.Content>
        <BottomSheet.Handle />
        <div style={{ padding: '0 1.5rem 0.75rem' }}>
          <BottomSheet.Title>목록</BottomSheet.Title>
        </div>
        <div data-woon-bottom-sheet-body>
          {[
            '사과',
            '바나나',
            '체리',
            '포도',
            '키위',
            '망고',
            '오렌지',
            '복숭아',
            '자두',
            '수박',
            '메론',
            '딸기',
          ].map((item) => (
            <div
              key={item}
              style={{ padding: '14px 1.5rem', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}
            >
              {item}
            </div>
          ))}
        </div>
      </BottomSheet.Content>
    </BottomSheet.Root>
  )
}

export function ControlledDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button onClick={() => setOpen(true)}>열기</Button>
      <BottomSheet.Root open={open} onOpenChange={setOpen}>
        <BottomSheet.Content>
          <BottomSheet.Handle />
          <div style={{ padding: '0 1.5rem 2rem' }}>
            <BottomSheet.Title style={{ marginBottom: 8 }}>제어 모드</BottomSheet.Title>
            <BottomSheet.Description style={{ marginBottom: 20 }}>
              open / onOpenChange prop으로 열림 상태를 직접 제어합니다.
            </BottomSheet.Description>
            <Button variant="outline" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </div>
        </BottomSheet.Content>
      </BottomSheet.Root>
    </div>
  )
}
