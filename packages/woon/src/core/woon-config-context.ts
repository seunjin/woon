import type * as React from 'react'
import { createContext, use } from 'react'
import type { AlertRenderContext } from '../overlay/dialog/alert'
import type { ConfirmRenderContext } from '../overlay/dialog/confirm'

export type WoonDefaultComponents = {
  confirm?: React.ComponentType<ConfirmRenderContext>
  alert?: React.ComponentType<AlertRenderContext>
}

export type WoonPlugin = {
  id: string
  render: () => React.ReactNode
}

export const WoonConfigContext = createContext<Record<string, never>>({})

export function useWoonConfig(): Record<string, never> {
  return use(WoonConfigContext)
}

// ─── imperative config store ─────────────────────────────────────────────────
// confirm() / alert()는 React 트리 밖에서 호출되므로
// WoonProvider가 설정을 여기에 동기화

let _defaults: WoonDefaultComponents = {}

export function setWoonDefaults(defaults: WoonDefaultComponents) {
  _defaults = defaults
}

export function getWoonDefaults(): WoonDefaultComponents {
  return _defaults
}
