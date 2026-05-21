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
