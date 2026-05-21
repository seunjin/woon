import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDialog } from '@woon-ui/dialog'
import { Drawer } from '@woon-ui/drawer'

const meta = {
  title: 'Components/Drawer',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>
type DrawerDirection = 'left' | 'right' | 'top' | 'bottom'

function DrawerFields() {
  return (
    <div className="woon-story-panel">
      <input className="woon-story-field" defaultValue="Woon UI" />
      <textarea
        className="woon-story-textarea"
        defaultValue="Drawer는 Dialog lifecycle을 그대로 사용합니다."
        rows={5}
      />
      <div className="woon-story-actions">
        <Drawer.Close asChild>
          <button type="button">닫기</button>
        </Drawer.Close>
        <button type="button">저장</button>
      </div>
    </div>
  )
}

function DrawerList({ direction }: { direction: DrawerDirection }) {
  if (direction === 'bottom') {
    return (
      <div className="woon-story-panel">
        <div data-woon-drawer-no-drag className="woon-story-card">
          <label className="woon-story-grid">
            <span className="woon-story-result">메모</span>
            <textarea
              rows={3}
              className="woon-story-textarea"
              defaultValue="data-woon-drawer-no-drag 안에서는 입력과 선택이 drag dismiss보다 우선합니다."
            />
          </label>
        </div>
        <div className="woon-story-list">
          {Array.from({ length: 12 }, (_, index) => `액션 ${index + 1}`).map((label) => (
            <button key={label} type="button">
              {label}
            </button>
          ))}
          <Drawer.Close asChild>
            <button type="button">닫기</button>
          </Drawer.Close>
        </div>
      </div>
    )
  }

  return (
    <div className="woon-story-panel">
      {direction === 'top' ? null : (
        <div className="woon-story-grid">
          <span className="woon-story-result">가로 스크롤 테스트</span>
          <div className="woon-story-scroll-row">
            {Array.from({ length: 8 }, (_, index) => `${direction} ${index + 1}`).map((item) => (
              <button key={item} type="button" className="woon-story-pill">
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="woon-story-list">
        {(direction === 'top'
          ? Array.from({ length: 12 }, (_, index) => `공지 ${index + 1}`)
          : ['Overview', 'Analytics', 'Members', 'Settings']
        ).map((item) => (
          <button key={item} type="button">
            {item}
          </button>
        ))}
        <Drawer.Close asChild>
          <button type="button">닫기</button>
        </Drawer.Close>
      </div>
    </div>
  )
}

function DrawerLauncher() {
  const dialog = useDialog()

  function openRightDrawer() {
    dialog.open(() => (
      <Drawer.Root direction="right">
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Title>오른쪽 Drawer</Drawer.Title>
          <Drawer.Description>
            Dialog overlay 시스템 위에서 동작하는 edge-attached surface입니다.
          </Drawer.Description>
          <DrawerFields />
        </Drawer.Content>
      </Drawer.Root>
    ))
  }

  function openDirectionalDrawer(direction: DrawerDirection) {
    dialog.open(() => (
      <Drawer.Root direction={direction} dragToClose>
        <Drawer.Overlay />
        <Drawer.Content
          style={
            direction === 'top' || direction === 'bottom'
              ? { maxHeight: direction === 'top' ? 'min(70dvh, 24rem)' : 'min(75dvh, 28rem)' }
              : { width: 'min(24rem, 100dvw)' }
          }
        >
          {direction === 'top' || direction === 'bottom' ? <Drawer.Handle /> : null}
          <Drawer.Title>{direction} Drawer</Drawer.Title>
          <Drawer.Description>
            {direction === 'bottom'
              ? '콘텐츠를 아래로 끌어 닫을 수 있고, 스크롤은 맨 위에서만 close drag로 전환됩니다.'
              : direction === 'top'
                ? '콘텐츠를 위로 끌어 닫을 수 있고, 스크롤은 맨 아래에서만 close drag로 전환됩니다.'
                : direction === 'right'
                  ? '콘텐츠를 오른쪽 edge로 끌어 닫을 수 있고, 가로 스크롤은 시작점에서만 close drag로 전환됩니다.'
                  : '콘텐츠를 왼쪽 edge로 끌어 닫을 수 있고, 가로 스크롤은 끝까지 이동했을 때만 close drag로 전환됩니다.'}
          </Drawer.Description>
          <DrawerList direction={direction} />
        </Drawer.Content>
      </Drawer.Root>
    ))
  }

  return (
    <div className="woon-story">
      <div className="woon-story-actions">
        <button type="button" onClick={openRightDrawer}>
          오른쪽 Drawer 열기
        </button>
        {(['left', 'right', 'top', 'bottom'] as const).map((direction) => (
          <button key={direction} type="button" onClick={() => openDirectionalDrawer(direction)}>
            {direction}
          </button>
        ))}
      </div>
    </div>
  )
}

export const Basic: Story = {
  render: () => <DrawerLauncher />,
}
