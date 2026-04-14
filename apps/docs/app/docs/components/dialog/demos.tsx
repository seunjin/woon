'use client'

import { useDialog } from '@woon/core'
import { alert, Dialog } from '@woon/core/dialog'

export function BasicDialogDemo() {
  const dialog = useDialog()

  return (
    <button
      type="button"
      onClick={() =>
        dialog.open(() => (
          <Dialog.Root>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Title>기본 다이얼로그</Dialog.Title>
              <Dialog.Description>ESC 또는 오버레이 클릭으로 닫을 수 있습니다.</Dialog.Description>
              <Dialog.Close>닫기</Dialog.Close>
            </Dialog.Content>
          </Dialog.Root>
        ))
      }
    >
      다이얼로그 열기
    </button>
  )
}

export function ResultDialogDemo() {
  const dialog = useDialog()

  return (
    <button
      type="button"
      onClick={async () => {
        const handle = dialog.open<undefined, string>(({ resolve, close }) => (
          <Dialog.Root>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Title>값을 선택하세요</Dialog.Title>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="button" onClick={() => resolve('A')}>
                  옵션 A
                </button>
                <button type="button" onClick={() => resolve('B')}>
                  옵션 B
                </button>
                <button type="button" onClick={close}>
                  취소
                </button>
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
    </button>
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
            <button type="button" onClick={() => openNested(depth + 1)}>
              다이얼로그 #{depth + 1} 열기
            </button>
            <button type="button" onClick={close}>
              닫기
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    ))
  }

  return (
    <button type="button" onClick={() => openNested(1)}>
      중첩 다이얼로그
    </button>
  )
}

export function SidePanelDemo() {
  const dialog = useDialog()

  return (
    <button
      type="button"
      onClick={() =>
        dialog.open(
          () => (
            <Dialog.Root options={{ overlay: false, trapFocus: false, scrollLock: false }}>
              <Dialog.Content
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  width: 320,
                  height: '100dvh',
                  background: 'white',
                  borderLeft: '1px solid #e5e5e5',
                  padding: 24,
                  boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
                }}
              >
                <Dialog.Title>사이드 패널</Dialog.Title>
                <Dialog.Description>
                  overlay, trapFocus, scrollLock을 모두 끄면 사이드 패널 패턴을 구현할 수 있습니다.
                </Dialog.Description>
                <Dialog.Close>닫기</Dialog.Close>
              </Dialog.Content>
            </Dialog.Root>
          ),
          { overlay: false, trapFocus: false, scrollLock: false },
        )
      }
    >
      사이드 패널
    </button>
  )
}
