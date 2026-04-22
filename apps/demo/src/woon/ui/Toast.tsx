/**
 * woon/ui — Toast
 *
 * toast()의 콘텐츠 컴포넌트.
 *
 * toast()는 라이브러리 기본 컴포넌트로 동작합니다. 스타일을 교체하려면
 * 이 파일을 복사한 뒤 <Toaster render={Toast} />에 연결하세요.
 */
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
          ✕
        </button>
      </div>
    </>
  )
}
