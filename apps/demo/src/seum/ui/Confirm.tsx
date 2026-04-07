/**
 * seum/ui — Confirm
 *
 * confirm()의 기본 렌더 컴포넌트.
 * SeumProvider defaults.confirm에 연결하거나 confirm({ render }) 으로 개별 오버라이드.
 * 이 파일을 복사해서 자유롭게 커스텀하세요.
 */
import './Confirm.css'
import type { ConfirmRenderContext } from 'seum/dialog'
import { DialogPrimitive } from './Dialog'

export function Confirm({ options, step, error, onConfirm, onCancel }: ConfirmRenderContext) {
  const {
    title,
    description,
    confirmLabel = '확인',
    cancelLabel = '취소',
    tone = 'default',
  } = options

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>
          {step === 'loading'
            ? '처리 중입니다'
            : step === 'success'
              ? '완료되었습니다'
              : step === 'error'
                ? '처리하지 못했습니다'
                : title}
        </DialogPrimitive.Title>
        {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
        {step === 'error' && error instanceof Error && <p>{error.message}</p>}
        <div>
          {(step === 'confirm' || step === 'error') && (
            <button type="button" onClick={onCancel}>
              {step === 'error' ? '닫기' : cancelLabel}
            </button>
          )}
          <button type="button" disabled={step === 'loading'} data-tone={tone} onClick={onConfirm}>
            {step === 'loading' ? '처리 중...' : step === 'success' ? '확인' : confirmLabel}
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}
