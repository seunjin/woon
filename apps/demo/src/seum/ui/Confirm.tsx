/**
 * seum/ui — Confirm
 *
 * confirm()의 기본 렌더 컴포넌트.
 * SeumProvider config.defaults.confirm에 연결하거나 confirm({ render }) 으로 개별 오버라이드.
 * 이 파일을 복사해서 자유롭게 커스텀하세요.
 */
import './Confirm.css'
import type { ConfirmRenderContext } from 'seum/dialog'
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
