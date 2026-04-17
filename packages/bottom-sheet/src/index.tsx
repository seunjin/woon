import {
  lockScroll,
  Portal,
  popEscapeHandler,
  pushEscapeHandler,
  Slot,
  unlockScroll,
} from '@woon-ui/primitive'
import type React from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { BottomSheetContext, useBottomSheetContext } from './context'
import { useDrag } from './use-drag'

export type { BottomSheetContextValue } from './context'

// ─── BottomSheet.Root ────────────────────────────────────────────────────────

type BottomSheetRootProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  snapPoints?: number[]
  defaultSnap?: number
  onSnapChange?: (index: number) => void
  children?: React.ReactNode
}

export function BottomSheetRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  snapPoints = [1],
  defaultSnap,
  onSnapChange,
  children,
}: BottomSheetRootProps) {
  const isControlled = controlledOpen !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const [snapIndex, setSnapIndex] = useState(defaultSnap ?? snapPoints.length - 1)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<'open' | 'closed'>(open ? 'open' : 'closed')

  const titleId = useId()
  const descriptionId = useId()

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const close = useCallback(() => setOpen(false), [setOpen])

  // Sync status with open
  useEffect(() => {
    if (open) {
      setStatus('open')
    } else {
      setStatus('closed')
    }
  }, [open])

  // Scroll lock + escape handler
  useEffect(() => {
    if (open) {
      lockScroll()
      pushEscapeHandler(close)
      return () => {
        unlockScroll()
        popEscapeHandler(close)
      }
    }
  }, [open, close])

  const handleSnap = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(snapPoints.length - 1, index))
      setSnapIndex(clamped)
      onSnapChange?.(clamped)
    },
    [snapPoints.length, onSnapChange],
  )

  const onDrag = useCallback((deltaY: number) => {
    setDragOffset(Math.max(0, deltaY))
    setIsDragging(true)
  }, [])

  const onEnd = useCallback(
    (deltaY: number, velocityY: number) => {
      setDragOffset(0)
      setIsDragging(false)

      const currentSnapHeight =
        typeof window !== 'undefined' ? (snapPoints[snapIndex] ?? 1) * window.innerHeight : 0

      if (velocityY > 0.5) {
        // Fast swipe down
        if (snapIndex === 0) {
          close()
        } else {
          handleSnap(snapIndex - 1)
        }
      } else if (velocityY < -0.5) {
        // Fast swipe up
        handleSnap(snapIndex + 1)
      } else if (deltaY > currentSnapHeight * 0.35) {
        // Dragged far enough down
        if (snapIndex === 0) {
          close()
        } else {
          handleSnap(snapIndex - 1)
        }
      }
      // else: snap back (stay at current snap, offset already reset to 0)
    },
    [snapIndex, snapPoints, close, handleSnap],
  )

  const dragHandleProps = useDrag({ onDrag, onEnd })

  return (
    <BottomSheetContext
      value={{
        open,
        setOpen,
        close,
        titleId,
        descriptionId,
        dragOffset,
        isDragging,
        dragHandleProps,
        snapPoints,
        snapIndex,
        status,
      }}
    >
      {children}
    </BottomSheetContext>
  )
}

// ─── BottomSheet.Trigger ─────────────────────────────────────────────────────

interface BottomSheetTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function BottomSheetTrigger({
  asChild,
  children,
  onClick,
  ...props
}: BottomSheetTriggerProps) {
  const ctx = useBottomSheetContext()
  const Comp = asChild ? Slot : 'button'

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e)
    ctx.setOpen(true)
  }

  return (
    <Comp data-woon-bottom-sheet-trigger onClick={handleClick} {...props}>
      {children}
    </Comp>
  )
}

// ─── BottomSheet.Content ─────────────────────────────────────────────────────

interface BottomSheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function BottomSheetContent({ children, style, ...props }: BottomSheetContentProps) {
  const ctx = useBottomSheetContext()
  const sheetRef = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (ctx.status !== 'open') return

    if (typeof document !== 'undefined') {
      prevFocusRef.current = document.activeElement as HTMLElement | null
    }

    const id = setTimeout(() => {
      if (!sheetRef.current) return
      const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const target = focusable[0] ?? sheetRef.current
      target?.focus()
    }, 0)

    return () => {
      clearTimeout(id)
      prevFocusRef.current?.focus()
    }
  }, [ctx.status])

  if (ctx.status !== 'open') return null

  const height = `${(ctx.snapPoints[ctx.snapIndex] ?? 1) * 100}dvh`
  const transform = ctx.isDragging ? `translateY(${ctx.dragOffset}px)` : ''
  const transition = ctx.isDragging
    ? 'none'
    : 'transform 0.3s cubic-bezier(0.32,0.72,0,1), height 0.3s cubic-bezier(0.32,0.72,0,1)'

  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: overlay dismissal handled by pointer, escape handled via escape stack */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop dismissal */}
      <div
        data-woon-bottom-sheet-overlay
        data-state="open"
        style={{ zIndex: 400 }}
        onClick={ctx.close}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ctx.titleId}
        aria-describedby={ctx.descriptionId}
        data-woon-bottom-sheet-content
        data-state="open"
        data-dragging={ctx.isDragging ? '' : undefined}
        tabIndex={-1}
        style={{
          height,
          transform,
          transition,
          zIndex: 401,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </Portal>
  )
}

// ─── BottomSheet.Handle ──────────────────────────────────────────────────────

type BottomSheetHandleProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'
>

export function BottomSheetHandle(props: BottomSheetHandleProps) {
  const ctx = useBottomSheetContext()

  return (
    <div data-woon-bottom-sheet-handle aria-hidden="true" {...ctx.dragHandleProps} {...props} />
  )
}

// ─── BottomSheet.Title ───────────────────────────────────────────────────────

interface BottomSheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function BottomSheetTitle({ asChild, children, ...props }: BottomSheetTitleProps) {
  const ctx = useBottomSheetContext()
  const Comp = asChild ? Slot : 'h2'

  return (
    <Comp id={ctx.titleId} data-woon-bottom-sheet-title {...props}>
      {children}
    </Comp>
  )
}

// ─── BottomSheet.Description ─────────────────────────────────────────────────

interface BottomSheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function BottomSheetDescription({
  asChild,
  children,
  ...props
}: BottomSheetDescriptionProps) {
  const ctx = useBottomSheetContext()
  const Comp = asChild ? Slot : 'p'

  return (
    <Comp id={ctx.descriptionId} data-woon-bottom-sheet-description {...props}>
      {children}
    </Comp>
  )
}

// ─── BottomSheet.Close ───────────────────────────────────────────────────────

interface BottomSheetCloseProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function BottomSheetClose({ asChild, children, onClick, ...props }: BottomSheetCloseProps) {
  const ctx = useBottomSheetContext()
  const Comp = asChild ? Slot : 'button'

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e)
    ctx.close()
  }

  return (
    <Comp data-woon-bottom-sheet-close onClick={handleClick} {...props}>
      {children}
    </Comp>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const BottomSheet = {
  Root: BottomSheetRoot,
  Trigger: BottomSheetTrigger,
  Content: BottomSheetContent,
  Handle: BottomSheetHandle,
  Title: BottomSheetTitle,
  Description: BottomSheetDescription,
  Close: BottomSheetClose,
}
