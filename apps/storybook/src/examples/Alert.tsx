import type { AlertRenderContext } from '@woon-ui/dialog'
import { DialogPrimitive } from './Dialog'

export function Alert({ options, close }: AlertRenderContext) {
  const { title, description, confirmLabel = '확인', tone = 'default' } = options

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
        {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
        <div>
          <button type="button" data-tone={tone} onClick={close}>
            {confirmLabel}
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}
