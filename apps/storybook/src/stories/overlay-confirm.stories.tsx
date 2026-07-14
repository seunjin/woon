import type { Meta, StoryObj } from '@storybook/react-vite'
import { useOverlay } from '@woon-ui/core'
import { useState } from 'react'

const meta = {
  title: 'VNext/Overlay Confirm',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function OverlayConfirmStory() {
  const overlay = useOverlay()
  const [result, setResult] = useState('-')

  async function runBasic() {
    const confirmed = await overlay.confirm({
      title: '변경사항을 저장할까요?',
      description: '저장하지 않으면 지금까지 입력한 내용이 사라집니다.',
      confirmLabel: '저장',
      cancelLabel: '취소',
    })
    setResult(confirmed ? '저장 선택' : '취소 선택')
  }

  async function runAsync() {
    const confirmed = await overlay.confirm({
      title: '프로덕션에 배포할까요?',
      description: '완료될 때까지 확인창을 닫을 수 없습니다.',
      confirmLabel: '배포',
      cancelLabel: '취소',
      onConfirm: () => new Promise((resolve) => window.setTimeout(resolve, 1400)),
    })
    setResult(confirmed ? '배포 완료' : '배포 취소')
  }

  async function runRetry() {
    let attempts = 0
    const confirmed = await overlay.confirm({
      title: '프로젝트를 삭제할까요?',
      description: '첫 번째 요청은 실패하고, 다시 시도하면 성공합니다.',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      tone: 'danger',
      onConfirm: async () => {
        attempts += 1
        await new Promise((resolve) => window.setTimeout(resolve, 900))
        if (attempts === 1) throw new Error('의도한 첫 번째 요청 실패')
      },
    })
    setResult(confirmed ? `${attempts}번째 시도에서 삭제 완료` : '삭제 취소')
  }

  return (
    <div className="woon-story">
      <p className="woon-story-result">
        결과: <code>{result}</code>
      </p>
      <div className="woon-story-actions">
        <button onClick={() => void runBasic()} type="button">
          기본 확인
        </button>
        <button onClick={() => void runAsync()} type="button">
          비동기 확인
        </button>
        <button onClick={() => void runRetry()} type="button">
          실패 후 재시도
        </button>
      </div>
    </div>
  )
}

export const VerticalSlice: Story = {
  render: () => <OverlayConfirmStory />,
}
