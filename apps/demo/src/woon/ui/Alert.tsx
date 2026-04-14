/**
 * woon/ui — Alert (커스텀 override 예시)
 *
 * alert()는 라이브러리 기본 컴포넌트로 동작합니다. 스타일을 교체하려면
 * 이 파일을 복사한 뒤 dialogPlugin({ defaults: { alert: Alert } })에 연결하세요.
 */
import type { AlertRenderContext } from '@woon/core/dialog'
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
