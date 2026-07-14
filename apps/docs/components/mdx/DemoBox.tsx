import './DemoBox.css'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function DemoBox({ children }: Props) {
  return (
    <div className="demo-box not-prose">
      <p className="demo-box-label">Preview</p>
      <div className="demo-box-content">{children}</div>
    </div>
  )
}
