/**
 * seum/ui — Dialog
 *
 * seum/dialog primitive 위에 기본 스타일을 얹은 ready-to-use 컴포넌트.
 * 이 파일을 복사해서 자유롭게 커스텀하세요.
 */
import './Dialog.css'
import { Dialog as DialogPrimitive, useSeumDialogContext } from '@woon/core/dialog'

export interface DialogProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function Dialog({ title, description, children }: DialogProps) {
  const { close } = useSeumDialogContext()

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
