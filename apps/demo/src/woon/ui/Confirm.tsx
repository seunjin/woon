/**
 * woon/ui — Confirm (커스텀 override 예시)
 *
 * confirm()는 라이브러리 기본 컴포넌트로 동작합니다. 스타일을 교체하려면
 * 이 파일을 복사한 뒤 <ModalRoot components={{ confirm: Confirm }} />에 연결하세요.
 */
import type { ConfirmRenderContext } from '@woon-ui/dialog'
import { DialogPrimitive } from './Dialog'

export function Confirm({
  options,
  step,
  title,
  description,
  confirmLabel,
  cancelLabel,
  showCancel,
  onConfirm,
  onCancel,
}: ConfirmRenderContext) {
  const { tone = 'default' } = options

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
        {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
        <div>
          {showCancel && (
            <button type="button" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button type="button" disabled={step === 'loading'} data-tone={tone} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}
