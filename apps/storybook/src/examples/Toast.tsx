import type { ToastDefaultRenderProps } from '@woon-ui/toast'

export type ToastProps = ToastDefaultRenderProps

export function Toast({ title, description, action, close }: ToastProps) {
  return (
    <>
      <div data-woon-toast-body>
        <span data-woon-toast-title>{title}</span>
        {description && <span data-woon-toast-description>{description}</span>}
      </div>
      <div data-woon-toast-actions>
        {action && (
          <button type="button" data-woon-toast-action onClick={action.onClick}>
            {action.label}
          </button>
        )}
        <button type="button" data-woon-toast-close onClick={close} aria-label="닫기">
          x
        </button>
      </div>
    </>
  )
}
