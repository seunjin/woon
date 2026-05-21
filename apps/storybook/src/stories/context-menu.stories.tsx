import type { Meta, StoryObj } from '@storybook/react-vite'
import { ContextMenu } from '@woon-ui/context-menu'

const meta = {
  title: 'Components/ContextMenu',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function TriggerBox({ children }: { children: string }) {
  return <div className="woon-story-context-target">{children}</div>
}

function BasicStory() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerBox>여기서 우클릭 하세요</TriggerBox>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label>편집</ContextMenu.Label>
        <ContextMenu.Item onSelect={() => window.alert('복사')}>복사</ContextMenu.Item>
        <ContextMenu.Item onSelect={() => window.alert('붙여넣기')}>붙여넣기</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item onSelect={() => window.alert('삭제')}>삭제</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

function DisabledItemsStory() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerBox>여기서 우클릭 하세요 (비활성 항목 포함)</TriggerBox>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={() => window.alert('새 파일')}>새 파일</ContextMenu.Item>
        <ContextMenu.Item onSelect={() => window.alert('열기')}>열기</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item disabled>저장 (비활성)</ContextMenu.Item>
        <ContextMenu.Item disabled>다른 이름으로 저장 (비활성)</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

function GroupStory() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <TriggerBox>여기서 우클릭 하세요 (그룹 메뉴)</TriggerBox>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Group>
          <ContextMenu.Label>클립보드</ContextMenu.Label>
          <ContextMenu.Item onSelect={() => window.alert('잘라내기')}>잘라내기</ContextMenu.Item>
          <ContextMenu.Item onSelect={() => window.alert('복사')}>복사</ContextMenu.Item>
          <ContextMenu.Item onSelect={() => window.alert('붙여넣기')}>붙여넣기</ContextMenu.Item>
        </ContextMenu.Group>
        <ContextMenu.Separator />
        <ContextMenu.Group>
          <ContextMenu.Label>선택</ContextMenu.Label>
          <ContextMenu.Item onSelect={() => window.alert('전체 선택')}>전체 선택</ContextMenu.Item>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

export const Basic: Story = {
  render: () => <BasicStory />,
}

export const DisabledItems: Story = {
  render: () => <DisabledItemsStory />,
}

export const Group: Story = {
  render: () => <GroupStory />,
}
