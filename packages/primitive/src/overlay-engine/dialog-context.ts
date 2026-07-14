import type * as React from 'react'
import { createSafeContext } from '../shared/create-safe-context'
import type { DialogDataUpdater, DialogOptions, DialogStatus } from './types'

export type WoonDialogContextValue = {
  id: string
  close: () => void
  resolve: (value: unknown) => void
  closeAll: () => void
  options: DialogOptions
  /** dialog.open()에서 명시적으로 넘긴 옵션만 — Dialog.Root가 병합 우선순위 계산에 사용 */
  explicitOptions: Partial<DialogOptions>
  status: DialogStatus
  zIndex: number
}

export const [WoonDialogContext, useWoonDialogContext] =
  createSafeContext<WoonDialogContextValue>('Dialog')

export type DialogFlowStep = 'confirm' | 'loading' | 'success' | 'error'

export type DialogPresetTone = 'default' | 'danger'

export type DialogMessageStep = {
  title?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
}

export type DialogFlowTransition<TData> = (
  step: DialogFlowStep,
  data?: DialogDataUpdater<TData>,
) => void
