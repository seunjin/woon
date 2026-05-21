import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from '@woon-ui/toast'

const meta = {
  title: 'Components/Toast',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function toastBasic() {
  toast({ title: '파일이 저장되었습니다' })
}

function toastDanger() {
  toast({ title: '서버 연결에 실패했습니다' }, { tone: 'danger' })
}

function toastUndo() {
  toast(
    {
      title: '파일이 삭제되었습니다',
      action: { label: '실행 취소', onClick: () => {} },
    },
    { duration: Infinity },
  )
}

function toastUpdate() {
  const handle = toast({ title: '업로드 중...' }, { duration: Infinity })
  window.setTimeout(() => {
    handle.update({ title: '업로드 완료!' })
    window.setTimeout(() => handle.close(), 3000)
  }, 1500)
}

function toastStack() {
  for (let i = 1; i <= 5; i++) {
    window.setTimeout(() => toast({ title: `알림 ${i}번` }), i * 600)
  }
}

function ToastStory() {
  return (
    <div className="woon-story">
      <div className="woon-story-actions">
        <button type="button" onClick={toastBasic}>
          기본 (5초 자동 닫힘)
        </button>
        <button type="button" onClick={toastDanger}>
          Danger 톤
        </button>
        <button type="button" onClick={toastUndo}>
          Undo (영구 유지)
        </button>
        <button type="button" onClick={toastUpdate}>
          업로드 완료 업데이트
        </button>
        <button type="button" onClick={toastStack}>
          5개 한번에
        </button>
      </div>
    </div>
  )
}

export const Basic: Story = {
  render: () => <ToastStory />,
}
