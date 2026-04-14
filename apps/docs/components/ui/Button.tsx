/**
 * docs 전용 Button 컴포넌트 — @woon/core와 무관한 문서 UI 전용 컴포넌트.
 * 라이브 데모 트리거, 문서 내 링크 버튼 등 docs 사이트 UI에서만 사용한다.
 */

import type { ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`docs-btn docs-btn--${variant} docs-btn--${size} ${className}`.trim()}
      {...props}
    />
  )
}
