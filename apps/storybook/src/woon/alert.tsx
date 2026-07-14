import { AlertDialog } from '@base-ui/react/alert-dialog'
import type { AlertSurfaceProps } from '@woon-ui/core'
import './overlay.css'

export function AlertSurface({
  acknowledge,
  completeClose,
  open,
  request,
  requestClose,
}: AlertSurfaceProps) {
  if (!request) return null

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) requestClose()
      }}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) completeClose()
      }}
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
            </div>

            <div className="woon-overlay-actions">
              <button
                className="woon-overlay-button woon-overlay-button-primary"
                onClick={acknowledge}
                type="button"
              >
                {request.acknowledgeLabel ?? '확인'}
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
