import type { Meta, StoryObj } from '@storybook/react-vite'
import { confirm } from '@woon-ui/dialog'
import { useState } from 'react'

const meta = {
  title: 'Components/Confirm',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function ConfirmStory() {
  const [result, setResult] = useState('')

  async function runConfirmBasic() {
    const next = await confirm({
      title: '변경사항을 저장할까요?',
      description: '저장하지 않으면 변경사항이 사라집니다.',
      confirmLabel: '저장',
      cancelLabel: '취소',
    })
    setResult(JSON.stringify(next))
  }

  async function runConfirmAsync() {
    const next = await confirm({
      title: '배포를 진행할까요?',
      description: '프로덕션에 즉시 반영됩니다.',
      confirmLabel: '배포',
      cancelLabel: '취소',
      onConfirm: async () => {
        await new Promise((resolve) => window.setTimeout(resolve, 1200))
      },
      loading: { title: '배포 중', confirmLabel: '처리 중...' },
      success: {
        title: '배포 완료',
        description: '프로덕션에 반영되었습니다.',
        confirmLabel: '확인',
      },
    })
    setResult(JSON.stringify(next))
  }

  async function runConfirmError() {
    const next = await confirm({
      title: '계정을 삭제할까요?',
      description: '이 작업은 되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      tone: 'danger',
      onConfirm: async () => {
        await new Promise((_, reject) =>
          window.setTimeout(() => reject(new Error('서버 오류')), 900),
        )
      },
      loading: { title: '삭제 중', confirmLabel: '처리 중...' },
      error: (error) => ({
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '다시 시도해주세요.',
        confirmLabel: '다시 시도',
        cancelLabel: '닫기',
      }),
    })
    setResult(JSON.stringify(next))
  }

  return (
    <div className="woon-story">
      <p className="woon-story-result">
        결과: <code>{result || '-'}</code>
      </p>
      <div className="woon-story-actions">
        <button type="button" onClick={() => void runConfirmBasic()}>
          기본
        </button>
        <button type="button" onClick={() => void runConfirmAsync()}>
          비동기 + 성공
        </button>
        <button type="button" onClick={() => void runConfirmError()}>
          비동기 + 에러 재시도
        </button>
      </div>
    </div>
  )
}

export const Basic: Story = {
  render: () => <ConfirmStory />,
}
