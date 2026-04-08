import { useState } from 'react'
import { alert, confirm, useDialog, useSeumDialogContext } from 'seum/dialog'
import { toast } from 'seum/toast'
import { Modal } from './components/Modal'
import { SidePanel } from './components/SidePanel'
import { DialogPrimitive } from './seum/ui/Dialog'
import { Toast } from './seum/ui/Toast'

// ─── 중첩 모달 ────────────────────────────────────────────────────────────────

function NestedModal({ depth }: { depth: number }) {
  const { close, closeAll } = useSeumDialogContext()
  const dialog = useDialog()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>중첩 모달 {depth}단계</DialogPrimitive.Title>
        <DialogPrimitive.Description>ESC는 최상단만 닫습니다.</DialogPrimitive.Description>
        <div>
          <button
            type="button"
            onClick={() => dialog.open(() => <NestedModal depth={depth + 1} />)}
          >
            한 단계 더
          </button>
          <button type="button" onClick={closeAll}>
            모두 닫기
          </button>
          <button type="button" onClick={close}>
            이것만 닫기
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}

// ─── 값 반환 모달 ─────────────────────────────────────────────────────────────

function ResolveModal() {
  const { resolve } = useSeumDialogContext()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>값 반환 테스트</DialogPrimitive.Title>
        <DialogPrimitive.Description>버튼에 따라 다른 값을 반환합니다.</DialogPrimitive.Description>
        <div>
          <DialogPrimitive.Close asChild>
            <button type="button">취소 (dismissed)</button>
          </DialogPrimitive.Close>
          <button type="button" onClick={() => resolve({ confirmed: true, value: 42 })}>
            확인 (resolved)
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export function App() {
  const dialog = useDialog()
  const [result, setResult] = useState<string>('')

  // ── Dialog ──

  function openBasic() {
    dialog.open(() => (
      <Modal title="기본 모달" description="useSeumDialogContext()로 close 접근." />
    ))
  }

  function openSidePanel() {
    dialog.open(() => (
      <SidePanel
        title="사이드 패널"
        description="Dialog.Root로 overlay=false, trapFocus=false, scrollLock=false."
      />
    ))
  }

  function openNested() {
    dialog.open(() => <NestedModal depth={1} />)
  }

  async function openResolve() {
    const handle = dialog.open<undefined, { confirmed: boolean; value: number } | undefined>(() => (
      <ResolveModal />
    ))
    const r = await handle.result
    setResult(JSON.stringify(r))
  }

  // ── confirm ──

  async function runConfirmBasic() {
    const r = await confirm({
      title: '변경사항을 저장할까요?',
      description: '저장하지 않으면 변경사항이 사라집니다.',
      confirmLabel: '저장',
      cancelLabel: '취소',
    })
    setResult(JSON.stringify(r))
  }

  async function runConfirmAsync() {
    const r = await confirm({
      title: '배포를 진행할까요?',
      description: '프로덕션에 즉시 반영됩니다.',
      confirmLabel: '배포',
      cancelLabel: '취소',
      onConfirm: async () => {
        await new Promise((res) => window.setTimeout(res, 1200))
      },
      loading: { title: '배포 중', confirmLabel: '처리 중...' },
      success: {
        title: '배포 완료',
        description: '프로덕션에 반영되었습니다.',
        confirmLabel: '확인',
      },
    })
    setResult(JSON.stringify(r))
  }

  async function runConfirmError() {
    const r = await confirm({
      title: '계정을 삭제할까요?',
      description: '이 작업은 되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      tone: 'danger',
      onConfirm: async () => {
        await new Promise((_, rej) => window.setTimeout(() => rej(new Error('서버 오류')), 900))
      },
      loading: { title: '삭제 중', confirmLabel: '처리 중...' },
      error: (err) => ({
        title: '삭제 실패',
        description: err instanceof Error ? err.message : '다시 시도해주세요.',
        confirmLabel: '다시 시도',
        cancelLabel: '닫기',
      }),
    })
    setResult(JSON.stringify(r))
  }

  // ── alert ──

  async function runAlertBasic() {
    await alert({ title: '저장되었습니다', confirmLabel: '확인' })
    setResult('alert closed')
  }

  async function runAlertDanger() {
    await alert({
      title: '접근이 거부되었습니다',
      description: '권한이 없습니다.',
      confirmLabel: '확인',
      tone: 'danger',
    })
    setResult('alert closed')
  }

  // ── toast ──

  function toastBasic() {
    toast(({ close }) => <Toast title="파일이 저장되었습니다" close={close} />)
  }

  function toastDanger() {
    toast(({ close }) => <Toast title="서버 연결에 실패했습니다" close={close} />, {
      tone: 'danger',
    })
  }

  function toastUndo() {
    toast(
      ({ close }) => (
        <Toast title="파일이 삭제되었습니다" action={{ label: '실행 취소', onClick: close }} />
      ),
      { duration: Infinity },
    )
  }

  function toastUpdate() {
    const handle = toast(({ close }) => <Toast title="업로드 중..." close={close} />, {
      duration: Infinity,
    })
    window.setTimeout(() => {
      handle.update(({ close }) => <Toast title="업로드 완료!" close={close} />)
      window.setTimeout(() => handle.close(), 3000)
    }, 1500)
  }

  function toastStack() {
    for (let i = 1; i <= 5; i++) {
      window.setTimeout(
        () => toast(({ close }) => <Toast title={`알림 ${i}번`} close={close} />),
        i * 600,
      )
    }
  }

  return (
    <div>
      <h1>Seum Demo</h1>
      <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>
        결과: <code>{result || '—'}</code>
      </p>

      <h2>Dialog</h2>
      <div className="section">
        <button type="button" onClick={openBasic}>
          기본 모달
        </button>
        <button type="button" onClick={openResolve}>
          값 반환
        </button>
        <button type="button" onClick={openNested}>
          중첩 모달
        </button>
        <button type="button" onClick={openSidePanel}>
          사이드 패널
        </button>
      </div>

      <h2>confirm()</h2>
      <div className="section">
        <button type="button" onClick={runConfirmBasic}>
          기본
        </button>
        <button type="button" onClick={runConfirmAsync}>
          비동기 + 성공
        </button>
        <button type="button" onClick={runConfirmError}>
          비동기 + 에러 재시도
        </button>
      </div>

      <h2>toast()</h2>
      <div className="section">
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
          업로드 → 완료 업데이트
        </button>
        <button type="button" onClick={toastStack}>
          5개 한번에
        </button>
      </div>

      <h2>alert()</h2>
      <div className="section">
        <button type="button" onClick={runAlertBasic}>
          기본
        </button>
        <button type="button" onClick={runAlertDanger}>
          Danger 톤
        </button>
      </div>
    </div>
  )
}
