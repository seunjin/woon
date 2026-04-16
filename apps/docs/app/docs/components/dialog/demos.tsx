'use client'

import { alert, Dialog } from '@woon-ui/dialog'
import { useDialog } from '@woon-ui/react'
import { Button } from '@/components/ui/Button'

export function BasicDialogDemo() {
  const dialog = useDialog()

  return (
    <Button
      onClick={() =>
        dialog.open(() => (
          <Dialog.Root>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Title>기본 다이얼로그</Dialog.Title>
              <Dialog.Description>ESC 또는 오버레이 클릭으로 닫을 수 있습니다.</Dialog.Description>
              <Dialog.Close asChild>
                <Button variant="outline">닫기</Button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Root>
        ))
      }
    >
      다이얼로그 열기
    </Button>
  )
}

export function ResultDialogDemo() {
  const dialog = useDialog()

  return (
    <Button
      onClick={async () => {
        const handle = dialog.open<undefined, string>(({ resolve, close }) => (
          <Dialog.Root>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Title>값을 선택하세요</Dialog.Title>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button onClick={() => resolve('A')}>옵션 A</Button>
                <Button onClick={() => resolve('B')}>옵션 B</Button>
                <Button variant="outline" onClick={close}>
                  취소
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Root>
        ))

        const result = await handle.result
        if (result.status === 'resolved') {
          await alert({ title: `선택: ${result.value}` })
        }
      }}
    >
      값 반환 예제
    </Button>
  )
}

export function NestedDialogDemo() {
  const dialog = useDialog()

  const openNested = (depth: number) => {
    dialog.open(({ close }) => (
      <Dialog.Root>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>다이얼로그 #{depth}</Dialog.Title>
          <Dialog.Description>
            다이얼로그를 중첩할 수 있습니다. ESC는 가장 위의 다이얼로그만 닫습니다.
          </Dialog.Description>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button onClick={() => openNested(depth + 1)}>다이얼로그 #{depth + 1} 열기</Button>
            <Button variant="outline" onClick={close}>
              닫기
            </Button>
            {depth > 1 && (
              <Button variant="ghost" onClick={() => dialog.closeAll()}>
                모두 닫기
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Root>
    ))
  }

  return <Button onClick={() => openNested(1)}>중첩 다이얼로그</Button>
}
