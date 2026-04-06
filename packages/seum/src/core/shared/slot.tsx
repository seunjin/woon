import * as React from 'react'
import { mergeProps } from './merge-props'

interface SlotProps {
  children?: React.ReactNode
  ref?: React.Ref<HTMLElement>
  [key: string]: unknown
}

/**
 * asChild 구현체.
 * Slot에 전달된 props를 단일 자식 엘리먼트에 병합합니다.
 */
export function Slot({ children, ...slotProps }: SlotProps) {
  if (!React.isValidElement(children)) {
    return children as React.ReactElement
  }

  return React.cloneElement(
    children,
    mergeProps(slotProps, children.props as Record<string, unknown>),
  )
}
