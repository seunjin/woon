import type * as React from 'react'

export type DialogOptions = {
  overlay: boolean
  modal: boolean
  scrollLock: boolean
  closeOnOverlayClick: boolean
}

export type DialogRenderContext = {
  close: () => void
  resolve: (value: unknown) => void
}

export type DialogStatus = 'open' | 'closed'

export type DialogInstance = {
  id: string
  render: (ctx: DialogRenderContext) => React.ReactNode
  options: DialogOptions
  zIndex: number
  status: DialogStatus
  resolve?: (value: unknown) => void
}

export const DEFAULT_DIALOG_OPTIONS: DialogOptions = {
  overlay: true,
  modal: true,
  scrollLock: true,
  closeOnOverlayClick: true,
}
