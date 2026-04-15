import './Callout.css'
import type { ReactNode } from 'react'

type CalloutType = 'note' | 'tip' | 'warning' | 'danger'

const config: Record<CalloutType, { label: string; className: string }> = {
  note: {
    label: 'Note',
    className: 'callout-note',
  },
  tip: {
    label: 'Tip',
    className: 'callout-tip',
  },
  warning: {
    label: 'Warning',
    className: 'callout-warning',
  },
  danger: {
    label: 'Danger',
    className: 'callout-danger',
  },
}

type Props = {
  type?: CalloutType
  title?: string
  children: ReactNode
}

export function Callout({ type = 'note', title, children }: Props) {
  const { label, className } = config[type]

  return (
    <div className={`callout ${className}`}>
      <p className="callout-label">{title ?? label}</p>
      <div className="callout-body">{children}</div>
    </div>
  )
}
