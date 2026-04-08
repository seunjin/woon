import { Portal } from '../../core/overlay-engine/portal'
import { useOverlayStore } from '../../core/overlay-engine/store'
import type { SeumDefaultComponents, SeumPlugin } from '../../core/seum-config-context'
import { setSeumDefaults } from '../../core/seum-config-context'
import { DialogRenderer } from './renderer'

// ─── dialogPlugin ─────────────────────────────────────────────────────────────

export type DialogPluginOptions = {
  defaults?: SeumDefaultComponents
}

function DialogPluginRenderer({ defaults }: { defaults: SeumDefaultComponents | undefined }) {
  const { dialogs } = useOverlayStore()
  setSeumDefaults(defaults ?? ({} as SeumDefaultComponents))
  return (
    <Portal>
      {dialogs.map((dialog) => (
        <DialogRenderer key={dialog.id} dialog={dialog} />
      ))}
    </Portal>
  )
}

export function dialogPlugin(options: DialogPluginOptions = {}): SeumPlugin {
  return {
    id: 'seum/dialog',
    render: () => <DialogPluginRenderer defaults={options.defaults} />,
  }
}

// ─── re-exports ───────────────────────────────────────────────────────────────

export { useSeumDialogContext } from '../../core/overlay-engine/dialog-context'
export type {
  DialogContext,
  DialogDataUpdater,
  DialogHandle,
  DialogOptions,
  DialogResult,
  DialogStatus,
  SeumDialogContextValue,
} from '../../index'
export { useDialog } from '../../index'
export type { AlertRenderContext, DialogAlertOptions } from './alert'

export { alert } from './alert'
export type {
  ConfirmRenderContext,
  DialogConfirmErrorConfig,
  DialogConfirmOptions,
  DialogConfirmResult,
  DialogFlowStep,
  DialogMessageStep,
  DialogPresetTone,
} from './confirm'

export { confirm } from './confirm'
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogRoot,
  DialogTitle,
} from './primitives'
