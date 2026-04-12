import { Portal } from '../../core/overlay-engine/portal'
import { setBaseZIndex, useOverlayStore } from '../../core/overlay-engine/store'
import type { WoonDefaultComponents, WoonPlugin } from '../../core/woon-config-context'
import { setWoonDefaults } from '../../core/woon-config-context'
import { DialogRenderer } from './renderer'

// ─── dialogPlugin ─────────────────────────────────────────────────────────────

export type DialogPluginOptions = {
  /**
   * alert() / confirm() 기본 컴포넌트 override.
   * 미설정 시 라이브러리 내장 컴포넌트를 사용합니다.
   */
  render?: WoonDefaultComponents
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
  render: WoonDefaultComponents | undefined
  zIndex: number
}) {
  const { dialogs } = useOverlayStore()
  setBaseZIndex(zIndex)
  setWoonDefaults(render ?? ({} as WoonDefaultComponents))
  return (
    <Portal>
      {dialogs.map((dialog) => (
        <DialogRenderer key={dialog.id} dialog={dialog} />
      ))}
    </Portal>
  )
}

export function dialogPlugin(options: DialogPluginOptions = {}): WoonPlugin {
  return {
    id: 'woon/dialog',
    render: () => <DialogPluginRenderer render={options.render} zIndex={options.zIndex ?? 200} />,
  }
}

// ─── re-exports ───────────────────────────────────────────────────────────────

export { useWoonDialogContext } from '../../core/overlay-engine/dialog-context'
export type {
  DialogContext,
  DialogDataUpdater,
  DialogHandle,
  DialogOptions,
  DialogResult,
  DialogStatus,
  WoonDialogContextValue,
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
