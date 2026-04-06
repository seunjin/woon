import type * as React from 'react'
import { createSafeContext } from '../shared/create-safe-context'
import type { DialogDataUpdater, DialogOptions, DialogStatus } from './types'

export type SeumDialogContextValue = {
  id: string
  close: () => void
  resolve: (value: unknown) => void
  options: DialogOptions
  status: DialogStatus
  zIndex: number
}

export const [SeumDialogContext, useSeumDialogContext] =
  createSafeContext<SeumDialogContextValue>('Dialog')

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
