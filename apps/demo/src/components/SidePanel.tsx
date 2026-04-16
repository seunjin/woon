/**
 * 사이드 패널 — woon/ui/Dialog를 복사해서 커스텀한 예시.
 * overlay 제거, 우측 고정 포지셔닝, 슬라이드 애니메이션으로 override.
 */
import './SidePanel.css'
import { useWoonDialogContext } from '@woon-ui/dialog'
import { DialogPrimitive } from '../woon/ui/Dialog'

export interface SidePanelProps {
  title: string
  description?: string
  children?: React.ReactNode
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
