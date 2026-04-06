'use client'

import { Dialog, useDialog } from 'seum/dialog'

function DialogShell({
  title,
  description,
  children,
  contentClassName,
  overlayClassName,
}: {
  title: string
  description: string
  children?: React.ReactNode
  contentClassName?: string
  overlayClassName?: string
}) {
  return (
    <Dialog.Overlay className={overlayClassName}>
      <Dialog.Content className={contentClassName}>
        <Dialog.Title className="seum-docs-dialog-title">{title}</Dialog.Title>
        <Dialog.Description className="seum-docs-dialog-description">
          {description}
        </Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Overlay>
  )
}

function IntroDialog({ close }: { close: () => void }) {
  return (
    <DialogShell
      title="초대 플로우 미리보기"
      description="`dialog.open()`은 어디서든 열 수 있고, 내부 UI는 Compound Components로 자유롭게 구성합니다."
      contentClassName="seum-docs-dialog"
      overlayClassName="seum-docs-dialog-overlay"
    >
      <div className="seum-docs-dialog-body">
        <div className="seum-docs-dialog-note">프로젝트 권한: Viewer</div>
        <div className="seum-docs-dialog-note">대상: design-team@seum.dev</div>
      </div>
      <div className="seum-docs-dialog-footer">
        <Dialog.Close asChild>
          <button className="seum-docs-button is-muted" type="button" onClick={close}>
            나중에
          </button>
        </Dialog.Close>
        <button className="seum-docs-button is-primary" type="button" onClick={close}>
          초대 보내기
        </button>
      </div>
    </DialogShell>
  )
}

function SidePanelDialog({ close }: { close: () => void }) {
  return (
    <Dialog.Overlay>
      <Dialog.Content className="seum-docs-panel">
        <Dialog.Title className="seum-docs-dialog-title">Overlay 없는 패널</Dialog.Title>
        <Dialog.Description className="seum-docs-dialog-description">
          `overlay: false`일 때는 backdrop DOM 없이 content만 렌더링됩니다. 문서 데모도 같은 public
          API 위에서 동작합니다.
        </Dialog.Description>
        <div className="seum-docs-panel-list">
          <div>overlay: false</div>
          <div>modal: false</div>
          <div>scrollLock: false</div>
          <div>closeOnOverlayClick: false</div>
        </div>
        <Dialog.Close asChild>
          <button className="seum-docs-button is-primary" type="button" onClick={close}>
            패널 닫기
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Overlay>
  )
}

export function DialogDocsDemo() {
  const dialog = useDialog()

  async function handleConfirm() {
    const result = await dialog.confirm({
      title: '문서를 삭제할까요?',
      description: '이 작업은 되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      tone: 'danger',
      loading: {
        title: '삭제 중입니다',
        description: '같은 다이얼로그 인스턴스를 유지한 채 내부 단계만 전환합니다.',
        confirmLabel: '처리 중',
      },
      success: {
        title: '삭제가 완료되었습니다',
        description: '후속 캐시 정리까지 마쳤습니다.',
        confirmLabel: '확인',
      },
      error: {
        title: '삭제하지 못했습니다',
        description: '잠시 후 다시 시도해주세요.',
        confirmLabel: '다시 시도',
        cancelLabel: '닫기',
      },
      onConfirm: async () => {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 700)
        })
      },
    })

    if (result.status !== 'confirmed') return

    await dialog.alert({
      title: '후속 작업까지 이어졌습니다',
      description:
        '`dialog.confirm()`은 내부에서 단계를 처리하고, 호출부는 결과만 받아 후속 로직으로 넘어갈 수 있습니다.',
      confirmLabel: '확인',
    })
  }

  async function handleAlert() {
    await dialog.alert({
      title: '저장되었습니다',
      description: '`dialog.alert()`는 단일 확인 버튼이 필요한 공지성 모달에 맞습니다.',
      confirmLabel: '확인',
    })
  }

  return (
    <section className="seum-docs-demo">
      <div className="seum-docs-demo-header">
        <div>
          <div className="seum-docs-demo-eyebrow">Live preview</div>
          <h3 className="seum-docs-demo-title">문서 안에서 바로 흐름을 확인할 수 있습니다</h3>
          <p className="seum-docs-demo-copy">
            이 프리뷰는 `seum/css/tokens`, `seum/css/dialog`을 먼저 import하고, 그 위에 consumer
            CSS를 얹는 실제 사용 방식으로 구성했습니다.
          </p>
        </div>
        <div className="seum-docs-demo-actions">
          <button
            className="seum-docs-button is-primary"
            type="button"
            onClick={() => dialog.open(({ close }) => <IntroDialog close={close} />)}
          >
            기본 열기
          </button>
          <button className="seum-docs-button is-danger" type="button" onClick={handleConfirm}>
            Confirm 비동기
          </button>
          <button className="seum-docs-button is-muted" type="button" onClick={handleAlert}>
            Alert 열기
          </button>
          <button
            className="seum-docs-button is-ghost"
            type="button"
            onClick={() =>
              dialog.open(({ close }) => <SidePanelDialog close={close} />, {
                closeOnOverlayClick: false,
                modal: false,
                overlay: false,
                scrollLock: false,
              })
            }
          >
            Overlay 없는 패널
          </button>
        </div>
      </div>

      <div className="seum-docs-demo-summary">
        <div className="seum-docs-demo-chip">`open()`으로 커스텀 모달</div>
        <div className="seum-docs-demo-chip">`confirm()`으로 비동기 확인 흐름</div>
        <div className="seum-docs-demo-chip">`alert()`로 단일 확인 모달</div>
        <div className="seum-docs-demo-chip">`overlay: false`로 시트형 패널</div>
      </div>
    </section>
  )
}
