import type { ComponentType, ReactNode } from 'react'

export type ConfirmTone = 'neutral' | 'danger'

export type ConfirmRequest = {
  title: ReactNode
  description?: ReactNode
  confirmLabel: ReactNode
  cancelLabel?: ReactNode
  tone?: ConfirmTone
  dismiss?: 'allow' | 'block'
  dedupeKey?: string
  onConfirm?: () => void | Promise<void>
}

export type ConfirmStatus = 'idle' | 'open' | 'pending' | 'error' | 'closing'

export type ConfirmSnapshot = {
  open: boolean
  request: ConfirmRequest | null
  status: ConfirmStatus
  error: unknown | null
}

export type ConfirmSurfaceProps = ConfirmSnapshot & {
  confirm: () => void
  cancel: () => void
  requestClose: () => void
  completeClose: () => void
}

export type OverlayRenderers = {
  confirm: ComponentType<ConfirmSurfaceProps>
}

export type OverlayApi = {
  confirm: (request: ConfirmRequest) => Promise<boolean>
  dismissAll: (reason?: 'route-change' | 'programmatic') => void
}
