/**
 * seum/ui — Alert
 *
 * alert()의 기본 렌더 컴포넌트.
 * SeumProvider config.defaults.alert에 연결하거나 alert({ render }) 으로 개별 오버라이드.
 * 이 파일을 복사해서 자유롭게 커스텀하세요.
 */
import './Alert.css'
import type { AlertRenderContext } from 'seum/dialog'
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
