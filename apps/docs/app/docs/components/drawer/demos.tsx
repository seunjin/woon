'use client'

import { Drawer } from '@woon-ui/drawer'
import { useDialog } from '@woon-ui/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

function DrawerPanel({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div
      style={{ display: 'flex', minHeight: 0, flex: '1 1 auto', flexDirection: 'column', gap: 20 }}
    >
      <div>
        <Drawer.Title>{title}</Drawer.Title>
        <Drawer.Description>{description}</Drawer.Description>
      </div>

      <div style={{ display: 'grid', gap: 12, minHeight: 0, flex: '1 1 auto' }}>{children}</div>

      {footer ? (
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: 8,
            paddingTop: 16,
            borderTop: '1px solid #e5e7eb',
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export function BasicDrawerDemo() {
  const dialog = useDialog()

  return (
    <Button
      onClick={() =>
        dialog.open(() => (
          <Drawer.Root direction="right">
            <Drawer.Overlay />
            <Drawer.Content>
              <DrawerPanel
                title="프로젝트 세부 정보"
                description="Drawer는 Dialog와 같은 overlay lifecycle을 사용하면서 위치만 가장자리로 이동합니다."
                footer={
                  <>
                    <Drawer.Close asChild>
                      <Button variant="outline">닫기</Button>
                    </Drawer.Close>
                    <Button>저장</Button>
                  </>
                }
              >
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#52525b' }}>프로젝트 이름</span>
                  <input
                    defaultValue="Woon UI"
                    style={{
                      height: 40,
                      borderRadius: 10,
                      border: '1px solid #d4d4d8',
                      padding: '0 12px',
                    }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#52525b' }}>설명</span>
                  <textarea
                    defaultValue="Overlay behavioral complexity에 집중한 React UI primitives"
                    rows={5}
                    style={{
                      resize: 'vertical',
                      borderRadius: 10,
                      border: '1px solid #d4d4d8',
                      padding: 12,
                    }}
                  />
                </label>
              </DrawerPanel>
            </Drawer.Content>
          </Drawer.Root>
        ))
      }
    >
      오른쪽 Drawer
    </Button>
  )
}

export function DirectionDrawerDemo() {
  const dialog = useDialog()

  function openDrawer(direction: 'left' | 'right' | 'top') {
    const isTop = direction === 'top'
    const content = isTop
      ? {
          title: '상단 공지 패널',
          description:
            '콘텐츠를 위로 끌어 닫을 수 있고, 내부 스크롤은 맨 아래에서만 close drag로 전환됩니다.',
        }
      : {
          title: direction === 'left' ? '왼쪽 탐색 패널' : '오른쪽 설정 패널',
          description:
            direction === 'left'
              ? '오버레이 시스템은 그대로 유지하고, 표면만 edge-attached panel로 바꿉니다.'
              : 'direction만 바꾸면 같은 콘텐츠를 다른 edge에서 열 수 있습니다.',
        }

    dialog.open(() => (
      <Drawer.Root direction={direction} dragToClose={isTop}>
        <Drawer.Overlay />
        <Drawer.Content style={isTop ? { maxHeight: 'min(70dvh, 24rem)' } : undefined}>
          {isTop ? <Drawer.Handle /> : null}
          <DrawerPanel
            title={content.title}
            description={content.description}
            footer={
              <Drawer.Close asChild>
                <Button variant="outline">닫기</Button>
              </Drawer.Close>
            }
          >
            {isTop ? (
              <div style={{ display: 'grid', gap: 8, overflowY: 'auto', minHeight: 0 }}>
                {Array.from({ length: 10 }, (_, index) => `공지 ${index + 1}`).map((item) => (
                  <button
                    key={item}
                    type="button"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      minHeight: 42,
                      border: 'none',
                      borderRadius: 10,
                      background: '#fff',
                      padding: '0 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{item}</span>
                    <span style={{ color: '#a1a1aa' }}>›</span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  padding: 14,
                  borderRadius: 12,
                  background: '#f8fafc',
                }}
              >
                {['Overview', 'Analytics', 'Members', 'Settings'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      minHeight: 42,
                      border: 'none',
                      borderRadius: 10,
                      background: '#fff',
                      padding: '0 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{item}</span>
                    <span style={{ color: '#a1a1aa' }}>›</span>
                  </button>
                ))}
              </div>
            )}
          </DrawerPanel>
        </Drawer.Content>
      </Drawer.Root>
    ))
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="outline" onClick={() => openDrawer('left')}>
        left
      </Button>
      <Button variant="outline" onClick={() => openDrawer('right')}>
        right
      </Button>
      <Button variant="outline" onClick={() => openDrawer('top')}>
        top
      </Button>
    </div>
  )
}

export function BottomDrawerDemo() {
  const dialog = useDialog()

  return (
    <Button
      onClick={() =>
        dialog.open(() => (
          <Drawer.Root direction="bottom" dragToClose>
            <Drawer.Overlay />
            <Drawer.Content style={{ maxHeight: 'min(75dvh, 28rem)' }}>
              <Drawer.Handle />
              <DrawerPanel
                title="모바일 액션 패널"
                description="콘텐츠를 아래로 끌어 닫을 수 있고, 내부 스크롤은 맨 위에서만 close drag로 전환됩니다."
                footer={
                  <>
                    <Drawer.Close asChild>
                      <Button variant="outline">나중에</Button>
                    </Drawer.Close>
                    <Button>확인</Button>
                  </>
                }
              >
                <div style={{ display: 'grid', gap: 12, minHeight: 0 }}>
                  <div
                    data-woon-drawer-no-drag
                    style={{
                      display: 'grid',
                      gap: 6,
                      padding: 14,
                      borderRadius: 12,
                      background: '#f8fafc',
                    }}
                  >
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 13, color: '#52525b' }}>메모</span>
                      <textarea
                        rows={3}
                        defaultValue="입력 영역은 data-woon-drawer-no-drag 안에서 드래그 닫기에 반응하지 않습니다."
                        style={{
                          resize: 'vertical',
                          borderRadius: 10,
                          border: '1px solid #d4d4d8',
                          padding: 12,
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 8, overflowY: 'auto', minHeight: 0 }}>
                    {Array.from({ length: 12 }, (_, index) => `액션 ${index + 1}`).map((item) => (
                      <button
                        key={item}
                        type="button"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          minHeight: 48,
                          padding: '0 14px',
                          borderRadius: 12,
                          border: '1px solid #e5e7eb',
                          background: '#fff',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{item}</span>
                        <span style={{ color: '#a1a1aa' }}>›</span>
                      </button>
                    ))}
                  </div>
                </div>
              </DrawerPanel>
            </Drawer.Content>
          </Drawer.Root>
        ))
      }
    >
      bottom Drawer
    </Button>
  )
}
