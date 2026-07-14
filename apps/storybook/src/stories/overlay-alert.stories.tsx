import type { Meta, StoryObj } from '@storybook/react-vite'
import { useOverlay } from '@woon-ui/core'
import { useState } from 'react'

const meta = {
  title: 'VNext/Overlay Alert',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function OverlayAlertStory() {
  const overlay = useOverlay()
  const [result, setResult] = useState('-')

  async function runBasic() {
    await overlay.alert({
      title: '저장이 완료되었습니다.',
      description: '변경한 설정이 다음 접속부터 적용됩니다.',
      acknowledgeLabel: '알겠어요',
    })
    setResult('안내 확인')
  }

  async function runQueue() {
    const first = overlay.alert({
      title: '첫 번째 안내',
      description: '확인하면 다음 요청이 이어서 표시됩니다.',
    })
    const second = overlay.confirm({
      title: '계속 진행할까요?',
      description: 'alert와 confirm이 하나의 대기열을 공유합니다.',
      confirmLabel: '계속',
      cancelLabel: '그만두기',
    })

    await first
    const confirmed = await second
    setResult(confirmed ? '대기열 확인 완료' : '대기열 확인 취소')
  }

  async function runDedupe() {
    const first = overlay.alert({ title: '한 번만 표시됩니다.', dedupeKey: 'saved-notice' })
    const duplicate = overlay.alert({
      title: '이 문구는 표시되지 않습니다.',
      dedupeKey: 'saved-notice',
    })

    await Promise.all([first, duplicate])
    setResult(first === duplicate ? '중복 요청 병합' : '중복 요청 분리')
  }

  return (
    <div className="woon-story">
      <p className="woon-story-result">
        결과: <code>{result}</code>
      </p>
      <div className="woon-story-actions">
        <button onClick={() => void runBasic()} type="button">
          기본 안내
        </button>
        <button onClick={() => void runQueue()} type="button">
          alert → confirm 대기열
        </button>
        <button onClick={() => void runDedupe()} type="button">
          중복 안내 병합
        </button>
      </div>
    </div>
  )
}

export const VerticalSlice: Story = {
  render: () => <OverlayAlertStory />,
}
