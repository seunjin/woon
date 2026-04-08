/**
 * seum/ui — Toast
 *
 * toast()의 콘텐츠 컴포넌트.
 *
 * toastPlugin({ defaultRender: Toast }) 등록 후 객체 문법으로 사용:
 *   toast({ title: '저장됨' })
 *   toast({ title: '삭제됨', action: { label: '실행 취소', onClick: undoFn } }, { duration: Infinity })
 *
 * 직접 렌더 함수로도 사용 가능:
 *   toast(({ close }) => <Toast title="..." close={close} />)
 *
 * 이 파일을 복사해서 자유롭게 커스텀하세요.
 */
import './Toast.css'
import type { ToastDefaultRenderProps } from 'seum/toast'

export type ToastProps = ToastDefaultRenderProps

export function Toast({ title, description, action, close }: ToastProps) {
  return (
    <>
      <div data-seum-toast-body>
        <span data-seum-toast-title>{title}</span>
        {description && <span data-seum-toast-description>{description}</span>}
      </div>
      <div data-seum-toast-actions>
        {action && (
          <button type="button" data-seum-toast-action onClick={action.onClick}>
            {action.label}
          </button>
        )}
        <button type="button" data-seum-toast-close onClick={close} aria-label="닫기">
          ✕
        </button>
      </div>
    </>
  )
}
