import type { ToastDefaultRenderProps } from './index'

/**
 * toastPlugin()의 기본 렌더 컴포넌트.
 * toastPlugin({ render }) 으로 교체 가능합니다.
 * CSS: seum/css 또는 seum/css/preset
 */
export function DefaultToast({ title, description, action, close }: ToastDefaultRenderProps) {
  return (
    <>
      <div data-seum-toast-body>
        <span data-seum-toast-title>{title}</span>
        {description !== undefined && <span data-seum-toast-description>{description}</span>}
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
