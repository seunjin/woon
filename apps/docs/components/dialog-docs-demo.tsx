'use client'

import type { DialogHandle } from 'seum/dialog'
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

type AsyncFlowState =
  | { phase: 'confirm' }
  | { phase: 'loading' }
  | { phase: 'done' }
  | { phase: 'error'; message: string }

function ConfirmDeleteDialog({
  state,
  onCancel,
  onConfirm,
  onRetry,
}: {
  state: AsyncFlowState
  onCancel: () => void
  onConfirm: () => void
  onRetry: () => void
}) {
  return (
    <DialogShell
      title={
        state.phase === 'confirm'
          ? '문서를 삭제할까요?'
          : state.phase === 'loading'
            ? '삭제 중입니다'
            : state.phase === 'done'
              ? '삭제가 완료되었습니다'
              : '삭제하지 못했습니다'
      }
      description={
        state.phase === 'confirm'
          ? '`open(...).result`로 결과를 기다리면서, 같은 다이얼로그 인스턴스를 `update()`로 전환할 수 있습니다.'
          : state.phase === 'loading'
            ? 'confirm -> loading -> done/error 흐름을 같은 모달 안에서 이어갑니다.'
            : state.phase === 'done'
              ? 'Promise 결과를 기다리는 동안에도 모달 상태는 같은 인스턴스에서 유지됩니다.'
              : '비동기 실패 시에도 같은 모달을 유지한 채 재시도를 보여줄 수 있습니다.'
      }
      contentClassName="seum-docs-dialog"
      overlayClassName="seum-docs-dialog-overlay"
    >
      <div className="seum-docs-dialog-body">
        {state.phase === 'confirm' && (
          <div className="seum-docs-dialog-warning">이 작업은 되돌릴 수 없습니다.</div>
        )}
        {state.phase === 'loading' && (
          <div className="seum-docs-dialog-note">
            삭제 요청을 처리하고 있습니다. 잠시만 기다려주세요.
          </div>
        )}
        {state.phase === 'done' && (
          <div className="seum-docs-dialog-note">
            문서를 안전하게 제거했고, 후속 캐시 정리까지 마쳤습니다.
          </div>
        )}
        {state.phase === 'error' && <div className="seum-docs-dialog-warning">{state.message}</div>}
      </div>
      <div className="seum-docs-dialog-footer">
        {state.phase === 'confirm' && (
          <>
            <button className="seum-docs-button is-muted" type="button" onClick={onCancel}>
              취소
            </button>
            <button className="seum-docs-button is-danger" type="button" onClick={onConfirm}>
              삭제
            </button>
          </>
        )}
        {state.phase === 'loading' && (
          <button className="seum-docs-button is-muted" type="button" disabled>
            처리 중
          </button>
        )}
        {state.phase === 'done' && (
          <button className="seum-docs-button is-primary" type="button" onClick={onConfirm}>
            확인
          </button>
        )}
        {state.phase === 'error' && (
          <>
            <button className="seum-docs-button is-muted" type="button" onClick={onCancel}>
              닫기
            </button>
            <button className="seum-docs-button is-primary" type="button" onClick={onRetry}>
              다시 시도
            </button>
          </>
        )}
      </div>
    </DialogShell>
  )
}

function AsyncResultDialog({
  close,
  title,
  description,
}: {
  close: () => void
  title: string
  description: string
}) {
  return (
    <DialogShell
      title={title}
      description={description}
      contentClassName="seum-docs-dialog"
      overlayClassName="seum-docs-dialog-overlay"
    >
      <div className="seum-docs-dialog-footer is-single">
        <Dialog.Close asChild>
          <button className="seum-docs-button is-primary" type="button" onClick={close}>
            확인
          </button>
        </Dialog.Close>
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

  async function handleAsyncFlow() {
    let flow!: DialogHandle<AsyncFlowState, boolean>

    flow = dialog.open<AsyncFlowState, boolean>(
      ({ state, close, resolve }) => (
        <ConfirmDeleteDialog
          state={state}
          onCancel={close}
          onConfirm={async () => {
            if (state.phase === 'done') {
              resolve(true)
              return
            }

            flow.update({ phase: 'loading' })
            await new Promise((promiseResolve) => {
              window.setTimeout(promiseResolve, 700)
            })

            flow.update({ phase: 'done' })
          }}
          onRetry={async () => {
            flow.update({ phase: 'loading' })
            await new Promise((promiseResolve) => {
              window.setTimeout(promiseResolve, 700)
            })
            flow.update({ phase: 'done' })
          }}
        />
      ),
      { initialState: { phase: 'confirm' } },
    )

    const result = await flow.result

    if (result.status === 'dismissed') {
      dialog.open(({ close }) => (
        <AsyncResultDialog
          close={close}
          title="삭제를 취소했습니다"
          description="`dismissed` 결과로 정산되면 후속 작업을 건너뛰고 다른 분기로 자연스럽게 이어질 수 있습니다."
        />
      ))
      return
    }

    dialog.open(({ close }) => (
      <AsyncResultDialog
        close={close}
        title="후속 작업까지 이어졌습니다"
        description="`await dialog.open(...).result` 이후에도 같은 함수 안에서 후속 로직을 계속 이어갈 수 있습니다."
      />
    ))
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
          <button className="seum-docs-button is-muted" type="button" onClick={handleAsyncFlow}>
            비동기 상태 업데이트
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
        <div className="seum-docs-demo-chip">`open()`으로 기본 모달</div>
        <div className="seum-docs-demo-chip">`open(...).result`로 결과 대기</div>
        <div className="seum-docs-demo-chip">`update()`로 같은 모달 상태 전환</div>
        <div className="seum-docs-demo-chip">`overlay: false`로 시트형 패널</div>
      </div>
    </section>
  )
}
