/**
 * seum/ui — Toast
 *
 * toast()의 콘텐츠 컴포넌트.
 * toast(({ close }) => <Toast title="..." close={close} />) 형태로 사용합니다.
 * 이 파일을 복사해서 자유롭게 커스텀하세요.
 */
import './Toast.css'

export interface ToastProps {
  title: React.ReactNode
  description?: React.ReactNode
  /**
   * 액션 버튼 (실행 취소 등 인터랙션이 필요한 경우)
   */
  action?: {
    label: React.ReactNode
    onClick: () => void
  }
  /**
   * X 버튼으로 수동 닫기. ToastRenderContext의 close를 전달하세요.
   * duration: Infinity 토스트에는 반드시 close 또는 action 중 하나가 있어야 합니다.
   */
  close?: () => void
}

export function Toast({ title, description, action, close }: ToastProps) {
  return (
    <>
      <div data-seum-toast-body>
        <span data-seum-toast-title>{title}</span>
        {description && <span data-seum-toast-description>{description}</span>}
      </div>
      {(action || close) && (
        <div data-seum-toast-actions>
          {action && (
            <button type="button" data-seum-toast-action onClick={action.onClick}>
              {action.label}
            </button>
          )}
          {close && (
            <button type="button" data-seum-toast-close onClick={close} aria-label="닫기">
              ✕
            </button>
          )}
        </div>
      )}
    </>
  )
}
