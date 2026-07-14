import { Dialog as DialogPrimitive, useWoonDialogContext } from '@woon-ui/dialog'
import type { ReactNode } from 'react'

export interface DialogProps {
  title: string
  description?: string
  children?: ReactNode
}

export function Dialog({ title, description, children }: DialogProps) {
  const { close } = useWoonDialogContext()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
        {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
        {children}
        <div>
          <DialogPrimitive.Close asChild>
            <button type="button" onClick={close}>
              닫기
            </button>
          </DialogPrimitive.Close>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}

export { DialogPrimitive }
