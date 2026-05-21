import type { Meta, StoryObj } from '@storybook/react-vite'
import { DropdownMenu } from '@woon-ui/dropdown-menu'

const meta = {
  title: 'Components/DropdownMenu',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function BasicStory() {
  return (
    <div className="woon-story-actions">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>계정 메뉴</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>계정</DropdownMenu.Label>
          <DropdownMenu.Item onSelect={() => window.alert('프로필')}>프로필</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => window.alert('설정')}>설정</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={() => window.alert('로그아웃')}>로그아웃</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

function DisabledItemsStory() {
  return (
    <div className="woon-story-actions">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>파일</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => window.alert('새 파일')}>새 파일</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => window.alert('열기')}>열기</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item disabled>저장 (비활성)</DropdownMenu.Item>
          <DropdownMenu.Item disabled>다른 이름으로 저장 (비활성)</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

function GroupStory() {
  return (
    <div className="woon-story-actions">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>편집</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group>
            <DropdownMenu.Label>클립보드</DropdownMenu.Label>
            <DropdownMenu.Item onSelect={() => window.alert('잘라내기')}>
              잘라내기
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => window.alert('복사')}>복사</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => window.alert('붙여넣기')}>
              붙여넣기
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <DropdownMenu.Group>
            <DropdownMenu.Label>선택</DropdownMenu.Label>
            <DropdownMenu.Item onSelect={() => window.alert('전체 선택')}>
              전체 선택
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

function SideStory() {
  return (
    <div className="woon-story-actions">
      {(['bottom', 'top', 'right', 'left'] as const).map((side) => (
        <DropdownMenu.Root key={side} side={side}>
          <DropdownMenu.Trigger>{side}</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>항목 1</DropdownMenu.Item>
            <DropdownMenu.Item>항목 2</DropdownMenu.Item>
            <DropdownMenu.Item>항목 3</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ))}
    </div>
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

export const Side: Story = {
  render: () => <SideStory />,
}
