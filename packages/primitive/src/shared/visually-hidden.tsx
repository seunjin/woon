import type * as React from 'react'

const styles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
}

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

/**
 * 시각적으로는 보이지 않지만 스크린리더가 읽을 수 있는 요소입니다.
 */
export function VisuallyHidden({ children, style, ...props }: VisuallyHiddenProps) {
  return (
    <span style={{ ...styles, ...style }} {...props}>
      {children}
    </span>
  )
}
