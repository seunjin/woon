import { createContext, useContext, useState, useSyncExternalStore } from 'react'
import { createOverlayController, type OverlayController } from './controller'
import type { OverlayApi, OverlayRenderers } from './types'

const OverlayContext = createContext<OverlayApi | null>(null)

export type WoonProviderProps = {
  children: React.ReactNode
  renderers: OverlayRenderers
  controller?: OverlayController
}

export function WoonProvider({ children, renderers, controller }: WoonProviderProps) {
  const [internalController] = useState(createOverlayController)
  const activeController = controller ?? internalController
  const snapshot = useSyncExternalStore(
    activeController.subscribe,
    activeController.getSnapshot,
    activeController.getSnapshot,
  )
  const AlertSurface = renderers.alert
  const ConfirmSurface = renderers.confirm

  return (
    <OverlayContext.Provider value={activeController.overlay}>
      {children}
      {snapshot.kind === 'alert' ? (
        <AlertSurface
          acknowledge={activeController.acknowledgeCurrent}
          completeClose={activeController.completeClose}
          open={snapshot.open}
          request={snapshot.request}
          requestClose={activeController.requestClose}
          status={snapshot.status}
        />
      ) : null}
      {snapshot.kind === 'confirm' ? (
        <ConfirmSurface
          cancel={activeController.cancelCurrent}
          completeClose={activeController.completeClose}
          confirm={activeController.confirmCurrent}
          error={snapshot.error}
          open={snapshot.open}
          request={snapshot.request}
          requestClose={activeController.requestClose}
          status={snapshot.status}
        />
      ) : null}
    </OverlayContext.Provider>
  )
}

export function useOverlay(): OverlayApi {
  const overlay = useContext(OverlayContext)
  if (!overlay) throw new Error('useOverlay()는 <WoonProvider> 안에서 사용해야 합니다.')
  return overlay
}
