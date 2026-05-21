import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from '@woon-ui/select'
import { useState } from 'react'

const meta = {
  title: 'Components/Select',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function BasicStory() {
  const [value, setValue] = useState('')

  return (
    <div className="woon-story">
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="과일을 선택하세요" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">사과</Select.Item>
          <Select.Item value="banana">바나나</Select.Item>
          <Select.Item value="orange">오렌지</Select.Item>
          <Select.Item value="grape">포도</Select.Item>
          <Select.Item value="mango">망고</Select.Item>
        </Select.Content>
      </Select.Root>
      <p className="woon-story-result">선택된 값: {value || '없음'}</p>
    </div>
  )
}

function GroupStory() {
  const [value, setValue] = useState('')

  return (
    <div className="woon-story">
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger>
          <Select.Value placeholder="음식을 선택하세요" />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>과일</Select.Label>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
            <Select.Item value="mango" disabled>
              망고 (품절)
            </Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.Label>채소</Select.Label>
            <Select.Item value="carrot">당근</Select.Item>
            <Select.Item value="broccoli">브로콜리</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <p className="woon-story-result">선택된 값: {value || '없음'}</p>
    </div>
  )
}

function DisabledRootStory() {
  return (
    <div className="woon-story">
      <Select.Root disabled>
        <Select.Trigger>
          <Select.Value placeholder="비활성 셀렉트" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="a">항목 A</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  )
}

export const Basic: Story = {
  render: () => <BasicStory />,
}

export const GroupAndDisabledItem: Story = {
  render: () => <GroupStory />,
}

export const DisabledRoot: Story = {
  render: () => <DisabledRootStory />,
}
