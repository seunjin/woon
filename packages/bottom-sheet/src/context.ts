import { createSafeContext } from '@woon-ui/primitive'
import type React from 'react'

export type BottomSheetContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  close: () => void
  titleId: string
  descriptionId: string
  dragOffset: number
  isDragging: boolean
  dragHandleProps: {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => void
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => void
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => void
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void
  }
  snapPoints: number[]
  snapIndex: number
  status: 'open' | 'closing' | 'closed'
}

export const [BottomSheetContext, useBottomSheetContext] =
  createSafeContext<BottomSheetContextValue>('BottomSheet')
