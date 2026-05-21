import type { Meta, StoryObj } from '@storybook/react-vite'
import { alert as woonAlert } from '@woon-ui/dialog'
import { useState } from 'react'

const meta = {
  title: 'Components/Alert',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function AlertStory() {
  const [result, setResult] = useState('')

  async function runAlertBasic() {
    await woonAlert({ title: '저장되었습니다', confirmLabel: '확인' })
    setResult('alert closed')
  }

  async function runAlertDanger() {
    await woonAlert({
      title: '접근이 거부되었습니다',
      description: '권한이 없습니다.',
      confirmLabel: '확인',
      tone: 'danger',
    })
    setResult('alert closed')
  }

  return (
    <div className="woon-story">
      <p className="woon-story-result">
        결과: <code>{result || '-'}</code>
      </p>
      <div className="woon-story-actions">
        <button type="button" onClick={() => void runAlertBasic()}>
          기본
        </button>
        <button type="button" onClick={() => void runAlertDanger()}>
          Danger 톤
        </button>
      </div>
    </div>
  )
}

export const Basic: Story = {
  render: () => <AlertStory />,
}
