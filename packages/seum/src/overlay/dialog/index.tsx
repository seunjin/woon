import { Portal } from '../../core/overlay-engine/portal'
import { setBaseZIndex, useOverlayStore } from '../../core/overlay-engine/store'
import type { SeumDefaultComponents, SeumPlugin } from '../../core/seum-config-context'
import { setSeumDefaults } from '../../core/seum-config-context'
import { DialogRenderer } from './renderer'

// ─── dialogPlugin ─────────────────────────────────────────────────────────────

export type DialogPluginOptions = {
  /**
   * alert() / confirm() 기본 컴포넌트 override.
   * 미설정 시 라이브러리 내장 컴포넌트를 사용합니다.
   */
  render?: SeumDefaultComponents
  /**
   * dialog z-index 시작값. 다이얼로그가 쌓일수록 1씩 증가합니다.
   * @default 200
   */
  zIndex?: number
}

function DialogPluginRenderer({
  render,
  zIndex = 200,
}: {
  render: SeumDefaultComponents | undefined
  zIndex: number
}) {
  const { dialogs } = useOverlayStore()
  setBaseZIndex(zIndex)
  setSeumDefaults(render ?? ({} as SeumDefaultComponents))
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
    render: () => <DialogPluginRenderer render={options.render} zIndex={options.zIndex ?? 200} />,
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
