import type * as React from 'react'
import { createContext, use } from 'react'
import type { AlertRenderContext } from '../overlay/dialog/alert'
import type { ConfirmRenderContext } from '../overlay/dialog/confirm'

export type SeumDefaultComponents = {
  confirm?: React.ComponentType<ConfirmRenderContext>
  alert?: React.ComponentType<AlertRenderContext>
}

export type SeumPlugin = {
  id: string
  render: () => React.ReactNode
}

export const SeumConfigContext = createContext<Record<string, never>>({})

export function useSeumConfig(): Record<string, never> {
  return use(SeumConfigContext)
}

// ─── imperative config store ─────────────────────────────────────────────────
// confirm() / alert()는 React 트리 밖에서 호출되므로
// SeumProvider가 설정을 여기에 동기화

let _defaults: SeumDefaultComponents = {}

export function setSeumDefaults(defaults: SeumDefaultComponents) {
  _defaults = defaults
}

export function getSeumDefaults(): SeumDefaultComponents {
  return _defaults
}
