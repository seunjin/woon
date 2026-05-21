import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDialog, useWoonDialogContext } from '@woon-ui/dialog'
import { useState } from 'react'
import { DialogPrimitive } from '../examples/Dialog'
import { Modal } from '../examples/Modal'
import { SidePanel } from '../examples/SidePanel'

const meta = {
  title: 'Components/Dialog',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function NestedModal({ depth }: { depth: number }) {
  const { close, closeAll } = useWoonDialogContext()
  const dialog = useDialog()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>중첩 모달 {depth}단계</DialogPrimitive.Title>
        <DialogPrimitive.Description>ESC는 최상단만 닫습니다.</DialogPrimitive.Description>
        <div className="woon-story-actions">
          <button
            type="button"
            onClick={() => dialog.open(() => <NestedModal depth={depth + 1} />)}
          >
            한 단계 더
          </button>
          <button type="button" onClick={closeAll}>
            모두 닫기
          </button>
          <button type="button" onClick={close}>
            이것만 닫기
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}

function ResolveModal() {
  const { resolve } = useWoonDialogContext()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>값 반환 테스트</DialogPrimitive.Title>
        <DialogPrimitive.Description>버튼에 따라 다른 값을 반환합니다.</DialogPrimitive.Description>
        <div className="woon-story-actions">
          <DialogPrimitive.Close asChild>
            <button type="button">취소 (dismissed)</button>
          </DialogPrimitive.Close>
          <button type="button" onClick={() => resolve({ confirmed: true, value: 42 })}>
            확인 (resolved)
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}

function DialogStory() {
  const dialog = useDialog()
  const [result, setResult] = useState('')

  async function openResolve() {
    const handle = dialog.open<undefined, { confirmed: boolean; value: number } | undefined>(() => (
      <ResolveModal />
    ))
    setResult('waiting...')
    const next = await handle.result
    setResult(JSON.stringify(next))
  }

  return (
    <div className="woon-story">
      <p className="woon-story-result">
        결과: <code>{result || '-'}</code>
      </p>
      <div className="woon-story-actions">
        <button
          type="button"
          onClick={() =>
            dialog.open(() => (
              <Modal title="기본 모달" description="useWoonDialogContext()로 close 접근." />
            ))
          }
        >
          기본 모달
        </button>
        <button type="button" onClick={() => void openResolve()}>
          값 반환
        </button>
        <button type="button" onClick={() => dialog.open(() => <NestedModal depth={1} />)}>
          중첩 모달
        </button>
        <button
          type="button"
          onClick={() =>
            dialog.open(() => (
              <SidePanel
                title="사이드 패널"
                description="Dialog.Root로 overlay=false, trapFocus=false, scrollLock=false."
              />
            ))
          }
        >
          사이드 패널
        </button>
      </div>
    </div>
  )
}

export const Basic: Story = {
  render: () => <DialogStory />,
}
