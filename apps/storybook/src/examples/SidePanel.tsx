import { useWoonDialogContext } from '@woon-ui/dialog'
import type { ReactNode } from 'react'
import { DialogPrimitive } from './Dialog'
import './SidePanel.css'

export interface SidePanelProps {
  title: string
  description?: string
  children?: ReactNode
}

export function SidePanel({ title, description, children }: SidePanelProps) {
  const { close } = useWoonDialogContext()

  return (
    <DialogPrimitive.Root options={{ overlay: false, trapFocus: false, scrollLock: false }}>
      <DialogPrimitive.Content className="side-panel">
        <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
        {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
        {children}
        <div className="dialog-footer">
          <button type="button" className="btn btn-ghost" onClick={close}>
            닫기
          </button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}
