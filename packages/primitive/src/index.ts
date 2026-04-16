// ─── overlay-engine ───────────────────────────────────────────────────────────

export type {
  DialogFlowStep,
  DialogMessageStep,
  DialogPresetTone,
  WoonDialogContextValue,
} from './overlay-engine/dialog-context'
export { useWoonDialogContext, WoonDialogContext } from './overlay-engine/dialog-context'
export { popEscapeHandler, pushEscapeHandler } from './overlay-engine/escape-stack'
export { getFocusableElements, trapFocus } from './overlay-engine/focus-trap'
export { Portal } from './overlay-engine/portal'
export {
  lockScroll,
  setDefaultScrollTarget,
  unlockScroll,
} from './overlay-engine/scroll-lock'
export {
  overlayStore,
  setBaseZIndex,
  useFloatingZIndex,
  useOverlayStore,
} from './overlay-engine/store'
export type {
  DialogDataUpdater,
  DialogInstance,
  DialogOptions,
  DialogRenderContext,
  DialogResult,
  DialogStatus,
} from './overlay-engine/types'
export { DEFAULT_DIALOG_OPTIONS } from './overlay-engine/types'
export { getExitDuration, getRunningAnimations, waitForExit } from './shared/animation'
// ─── shared ───────────────────────────────────────────────────────────────────
export { createSafeContext } from './shared/create-safe-context'
export { getTransformOrigin } from './shared/get-transform-origin'
export { mergeProps } from './shared/merge-props'
export { Slot } from './shared/slot'
export { VisuallyHidden } from './shared/visually-hidden'

// ─── woon-config ──────────────────────────────────────────────────────────────
export type { WoonDefaultComponents, WoonPlugin } from './woon-config-context'
export { getWoonDefaults, setWoonDefaults } from './woon-config-context'
