import type { ToastDefaultRenderProps } from './index'

/**
 * Toaster의 기본 렌더 컴포넌트.
 * <Toaster render={...} />로 교체 가능합니다.
 * CSS: woon-ui/css 또는 woon-ui/css/preset
 */
export function DefaultToast({ title, description, action, close }: ToastDefaultRenderProps) {
  return (
    <>
      <div data-woon-toast-body>
        <span data-woon-toast-title>{title}</span>
        {description !== undefined && <span data-woon-toast-description>{description}</span>}
      </div>
      <div data-woon-toast-actions>
        {action && (
          <button type="button" data-woon-toast-action onClick={action.onClick}>
            {action.label}
          </button>
        )}
        <button type="button" data-woon-toast-close onClick={close} aria-label="닫기">
          ✕
        </button>
      </div>
    </>
  )
}
