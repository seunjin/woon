import type * as React from 'react'

export type DialogOptions = {
  overlay: boolean
  modal: boolean
  scrollLock: boolean
  closeOnOverlayClick: boolean
}

export type DialogResult<T> = { status: 'resolved'; value: T } | { status: 'dismissed' }

export type DialogDataUpdater<T> = T | ((prev: T) => T)

export type DialogRenderContext = {
  data: unknown
  close: () => void
  resolve: (value: unknown) => void
  update: (next: DialogDataUpdater<unknown>) => void
}

export type DialogStatus = 'open' | 'closed'

export type DialogInstance = {
  id: string
  data: unknown
  render: (ctx: DialogRenderContext) => React.ReactNode
  options: DialogOptions
  zIndex: number
  status: DialogStatus
  settled: boolean
  settle?: (result: DialogResult<unknown>) => void
}

export const DEFAULT_DIALOG_OPTIONS: DialogOptions = {
  overlay: true,
  modal: true,
  scrollLock: true,
  closeOnOverlayClick: true,
}
