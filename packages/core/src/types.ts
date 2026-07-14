import type { ComponentType, ReactNode } from 'react'

export type AlertRequest = {
  title: ReactNode
  description?: ReactNode
  acknowledgeLabel?: ReactNode
  dedupeKey?: string
}

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

export type AlertStatus = 'idle' | 'open' | 'closing'

export type AlertSnapshot = {
  open: boolean
  request: AlertRequest | null
  status: AlertStatus
}

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

export type AlertSurfaceProps = AlertSnapshot & {
  acknowledge: () => void
  requestClose: () => void
  completeClose: () => void
}

export type OverlayRenderers = {
  alert: ComponentType<AlertSurfaceProps>
  confirm: ComponentType<ConfirmSurfaceProps>
}

export type OverlayApi = {
  alert: (request: AlertRequest) => Promise<void>
  confirm: (request: ConfirmRequest) => Promise<boolean>
  dismissAll: (reason?: 'route-change' | 'programmatic') => void
}
