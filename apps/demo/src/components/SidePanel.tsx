/**
 * 사이드 패널 — seum/ui/Dialog를 복사해서 커스텀한 예시.
 * overlay 제거, 우측 고정 포지셔닝, 슬라이드 애니메이션으로 override.
 */
import '../seum/ui/Dialog.css'
import './SidePanel.css'
import { useSeumDialogContext } from 'seum/dialog'
import { DialogPrimitive } from '../seum/ui/Dialog'

export interface SidePanelProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function SidePanel({ title, description, children }: SidePanelProps) {
  const { close } = useSeumDialogContext()

  return (
    <DialogPrimitive.Root overlay={false} modal={false} scrollLock={false}>
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
