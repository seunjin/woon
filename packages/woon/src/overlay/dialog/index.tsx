import { Portal } from '../../core/overlay-engine/portal'
import { setDefaultScrollTarget } from '../../core/overlay-engine/scroll-lock'
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
  /**
   * scrollLock의 기본 대상 요소. CSS 선택자 또는 Element를 전달합니다.
   * body 대신 특정 스크롤 컨테이너를 앱 전역 기본값으로 지정할 때 사용합니다.
   * dialog.open() 호출 시 scrollTarget을 넘기면 해당 호출에서만 오버라이드됩니다.
   * @default undefined (document.body)
   */
  scrollTarget?: string | Element | null
}

function DialogPluginRenderer({
  render,
  zIndex = 200,
  scrollTarget = null,
}: {
  render: WoonDefaultComponents | undefined
  zIndex: number
  scrollTarget: string | Element | null
}) {
  const { dialogs } = useOverlayStore()
  setBaseZIndex(zIndex)
  setWoonDefaults(render ?? ({} as WoonDefaultComponents))
  setDefaultScrollTarget(scrollTarget)
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
    render: () => (
      <DialogPluginRenderer
        render={options.render}
        zIndex={options.zIndex ?? 200}
        scrollTarget={options.scrollTarget ?? null}
      />
    ),
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
