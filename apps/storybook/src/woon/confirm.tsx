'use client'

import { AlertDialog } from '@base-ui/react/alert-dialog'
import type { ConfirmSurfaceProps } from '@woon-ui/core'

import './overlay.css'

export function ConfirmSurface({
  cancel,
  completeClose,
  confirm,
  open,
  request,
  requestClose,
  status,
}: ConfirmSurfaceProps) {
  if (!request) return null

  const pending = status === 'pending'

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && requestClose()}
      onOpenChangeComplete={(nextOpen) => !nextOpen && completeClose()}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="woon-overlay-backdrop" />
        <AlertDialog.Viewport className="woon-overlay-viewport">
          <AlertDialog.Popup className="woon-overlay-popup">
            <div className="woon-overlay-copy">
              <AlertDialog.Title className="woon-overlay-title">{request.title}</AlertDialog.Title>
              {request.description ? (
                <AlertDialog.Description className="woon-overlay-description">
                  {request.description}
                </AlertDialog.Description>
              ) : null}
              {status === 'error' ? (
                <p className="woon-overlay-error" role="alert">
                  작업을 완료하지 못했습니다. 다시 시도해 주세요.
                </p>
              ) : null}
            </div>
            <div className="woon-overlay-actions">
              <button
                className="woon-overlay-button woon-overlay-button-secondary"
                disabled={pending}
                onClick={cancel}
                type="button"
              >
                {request.cancelLabel ?? '취소'}
              </button>
              <button
                aria-busy={pending}
                className="woon-overlay-button woon-overlay-button-primary"
                data-tone={request.tone ?? 'neutral'}
                disabled={pending}
                onClick={confirm}
                type="button"
              >
                {pending ? <span aria-hidden className="woon-overlay-spinner" /> : null}
                {pending ? '처리 중' : request.confirmLabel}
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
