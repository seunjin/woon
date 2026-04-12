import { useCallback, useEffect, useRef } from 'react'
import type { WoonDialogContextValue } from '../../core/overlay-engine/dialog-context'
import { WoonDialogContext } from '../../core/overlay-engine/dialog-context'
import { popEscapeHandler, pushEscapeHandler } from '../../core/overlay-engine/escape-stack'
import { lockScroll, unlockScroll } from '../../core/overlay-engine/scroll-lock'
import { overlayStore } from '../../core/overlay-engine/store'
import type {
  DialogDataUpdater,
  DialogInstance,
  DialogRenderContext,
} from '../../core/overlay-engine/types'
import { waitForExit } from '../../core/shared/animation'

export function DialogRenderer({ dialog }: { dialog: DialogInstance }) {
  const rootRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    overlayStore.settle(dialog.id, { status: 'dismissed', value: undefined })
    overlayStore.pop(dialog.id)
  }, [dialog.id])

  const closeAll = useCallback(() => {
    overlayStore.popAll()
  }, [])

  const resolve = useCallback(
    (value: unknown) => {
      overlayStore.settle(dialog.id, { status: 'resolved', value })
      overlayStore.pop(dialog.id)
    },
    [dialog.id],
  )

  const update = useCallback(
    (next: DialogDataUpdater<unknown>) => {
      overlayStore.update(dialog.id, next)
    },
    [dialog.id],
  )

  useEffect(() => {
    if (dialog.options.scrollLock) lockScroll()

    const handleEscape = () => close()
    pushEscapeHandler(handleEscape)

    return () => {
      if (dialog.options.scrollLock) unlockScroll()
      popEscapeHandler(handleEscape)
    }
  }, [close, dialog.options.scrollLock])

  useEffect(() => {
    if (dialog.status !== 'closed') return

    const root = rootRef.current
    if (!root) {
      overlayStore.remove(dialog.id)
      return
    }

    return waitForExit(root, () => overlayStore.remove(dialog.id))
  }, [dialog.id, dialog.status])

  const ctx: WoonDialogContextValue = {
    id: dialog.id,
    close,
    resolve,
    closeAll,
    options: dialog.options,
    explicitOptions: dialog.partialOptions ?? {},
    status: dialog.status,
    zIndex: dialog.zIndex,
  }

  const renderCtx: DialogRenderContext = { data: dialog.data, close, resolve, update }

  return (
    <div ref={rootRef} style={{ display: 'contents' }}>
      <WoonDialogContext value={ctx}>{dialog.render(renderCtx)}</WoonDialogContext>
    </div>
  )
}
