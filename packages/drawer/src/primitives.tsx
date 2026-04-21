import { Dialog } from '@woon-ui/dialog'
import type { DialogOptions } from '@woon-ui/primitive'
import { useWoonDialogContext } from '@woon-ui/primitive'
import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  DrawerContext,
  type DrawerDirection,
  type DrawerDragVisualState,
  useDrawerContext,
} from './context'
import { canStartBottomCloseDrag } from './drag'

const AXIS_LOCK_THRESHOLD = 8
const CLOSE_DISTANCE_RATIO = 0.25
const CLOSE_VELOCITY_THRESHOLD = 0.6
const DRAG_CLOSE_DURATION_MS = 160
const DRAG_RESET_DURATION_MS = 220
const OVERLAY_BASE_ALPHA = 0.52
const DRAG_CLOSE_TRANSITION = `${DRAG_CLOSE_DURATION_MS}ms ease-in`
const DRAG_RESET_TRANSITION = `${DRAG_RESET_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
const IDLE_DRAG_VISUAL_STATE: DrawerDragVisualState = {
  progress: 0,
  transition: null,
}

type DrawerRootProps = {
  children?: React.ReactNode
  direction?: DrawerDirection
  dragToClose?: boolean
  onOpenChange?: (open: boolean) => void
  options?: Partial<DialogOptions>
}

export interface DrawerContentProps extends React.ComponentProps<typeof Dialog.Content> {}

export interface DrawerOverlayProps extends React.ComponentProps<typeof Dialog.Overlay> {}
export interface DrawerTitleProps extends React.ComponentProps<typeof Dialog.Title> {}
export interface DrawerDescriptionProps extends React.ComponentProps<typeof Dialog.Description> {}
export interface DrawerCloseProps extends React.ComponentProps<typeof Dialog.Close> {}
export interface DrawerHandleProps extends React.HTMLAttributes<HTMLDivElement> {}

type DragMotion = {
  offset: number
  transition: string | null
}

type DragSession = {
  pointerId: number
  startX: number
  startY: number
  startTime: number
  target: EventTarget | null
  status: 'pending' | 'dragging' | 'blocked'
}

function useBottomDragToClose({
  direction,
  dragToClose,
  setDragVisualState,
}: {
  direction: DrawerDirection
  dragToClose: boolean
  setDragVisualState: (state: DrawerDragVisualState) => void
}) {
  const dialog = useWoonDialogContext()
  const [dragMotion, setDragMotion] = useState<DragMotion | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDragClosing, setIsDragClosing] = useState(false)
  const dragSessionRef = useRef<DragSession | null>(null)
  const suppressClickRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const canInteract = direction === 'bottom' && dragToClose && dialog.status === 'open'

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Drag-close exit motion should survive the dialog status flip to `closed`.
    if (canInteract || isDragClosing) return

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    dragSessionRef.current = null
    suppressClickRef.current = false
    setDragMotion(null)
    setIsDragging(false)
    setIsDragClosing(false)
    setDragVisualState(IDLE_DRAG_VISUAL_STATE)
  }, [canInteract, isDragClosing, setDragVisualState])

  function getDragProgress(offset: number, contentHeight: number) {
    return Math.min(Math.max(offset / contentHeight, 0), 1)
  }

  function scheduleReset() {
    setDragMotion({
      offset: 0,
      transition: DRAG_RESET_TRANSITION,
    })
    setDragVisualState({
      progress: 0,
      transition: DRAG_RESET_TRANSITION,
    })

    timerRef.current = window.setTimeout(() => {
      setDragMotion(null)
      setIsDragging(false)
      setDragVisualState(IDLE_DRAG_VISUAL_STATE)
      timerRef.current = null
    }, DRAG_RESET_DURATION_MS)
  }

  function scheduleClose(contentElement: HTMLDivElement) {
    const contentHeight = Math.max(contentElement.getBoundingClientRect().height, 1)

    setIsDragging(false)
    setIsDragClosing(true)
    setDragMotion({
      offset: contentHeight,
      transition: DRAG_CLOSE_TRANSITION,
    })
    setDragVisualState({
      progress: 1,
      transition: DRAG_CLOSE_TRANSITION,
    })

    timerRef.current = window.setTimeout(() => {
      dialog.close()
      timerRef.current = null
    }, DRAG_CLOSE_DURATION_MS)
  }

  function resetSession(contentElement: HTMLDivElement, pointerId: number) {
    if (contentElement.hasPointerCapture?.(pointerId)) {
      try {
        contentElement.releasePointerCapture(pointerId)
      } catch {
        // no-op
      }
    }

    dragSessionRef.current = null
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!canInteract || isDragClosing || isDragging) return
    if (!event.isPrimary) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    suppressClickRef.current = false
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      target: event.target,
      status: 'pending',
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!canInteract || isDragClosing) return

    const session = dragSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return

    const deltaX = event.clientX - session.startX
    const deltaY = event.clientY - session.startY

    if (session.status === 'pending') {
      if (Math.abs(deltaX) < AXIS_LOCK_THRESHOLD && Math.abs(deltaY) < AXIS_LOCK_THRESHOLD) {
        return
      }

      if (Math.abs(deltaY) <= Math.abs(deltaX) || deltaY <= 0) {
        session.status = 'blocked'
        return
      }

      if (!canStartBottomCloseDrag(session.target, event.currentTarget)) {
        session.status = 'blocked'
        return
      }

      session.status = 'dragging'
      setIsDragging(true)

      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // no-op
      }
    }

    if (session.status !== 'dragging') return

    const offset = Math.max(0, deltaY)
    const contentHeight = Math.max(event.currentTarget.getBoundingClientRect().height, 1)
    suppressClickRef.current = offset > AXIS_LOCK_THRESHOLD
    setDragMotion({ offset, transition: null })
    setDragVisualState({
      progress: getDragProgress(offset, contentHeight),
      transition: null,
    })

    if (event.cancelable) {
      event.preventDefault()
    }
  }

  function onPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (!canInteract) return

    const session = dragSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return

    const contentElement = event.currentTarget

    if (session.status !== 'dragging') {
      resetSession(contentElement, event.pointerId)
      return
    }

    const distance = Math.max(0, event.clientY - session.startY)
    const duration = Math.max(performance.now() - session.startTime, 1)
    const velocity = distance / duration
    const contentHeight = Math.max(contentElement.getBoundingClientRect().height, 1)
    const shouldClose =
      distance >= contentHeight * CLOSE_DISTANCE_RATIO || velocity >= CLOSE_VELOCITY_THRESHOLD

    resetSession(contentElement, event.pointerId)

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (shouldClose) {
      scheduleClose(contentElement)
      return
    }

    scheduleReset()
  }

  function onPointerCancel(event: React.PointerEvent<HTMLDivElement>) {
    if (!canInteract) return

    const session = dragSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return

    const contentElement = event.currentTarget
    resetSession(contentElement, event.pointerId)

    if (session.status === 'dragging') {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }

      scheduleReset()
    }
  }

  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return

    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  const dragStyle: React.CSSProperties | undefined = dragMotion
    ? {
        transform: `translate3d(0, ${dragMotion.offset}px, 0)`,
        transition: dragMotion.transition ? `transform ${dragMotion.transition}` : 'none',
        touchAction: 'none',
        userSelect: 'none',
      }
    : undefined

  return {
    dragStyle,
    isDragging,
    isDragClosing,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel,
      onClickCapture,
    },
  }
}

export function DrawerRoot(props: DrawerRootProps) {
  const { children, direction = 'right', dragToClose = false, onOpenChange, options } = props
  const [dragVisualState, setDragVisualState] =
    useState<DrawerDragVisualState>(IDLE_DRAG_VISUAL_STATE)
  const rootProps = {
    ...(onOpenChange ? { onOpenChange } : {}),
    ...(options ? { options } : {}),
  }
  const contextValue = { direction, dragToClose, dragVisualState, setDragVisualState }

  return (
    <Dialog.Root {...rootProps}>
      <DrawerContext value={contextValue}>{children}</DrawerContext>
    </Dialog.Root>
  )
}

export function DrawerOverlay(props: DrawerOverlayProps) {
  const { style, ...overlayProps } = props
  const { direction, dragToClose, dragVisualState } = useDrawerContext()
  const shouldFadeWithDrag = direction === 'bottom' && dragToClose
  const overlayAlpha = shouldFadeWithDrag
    ? OVERLAY_BASE_ALPHA * (1 - dragVisualState.progress)
    : OVERLAY_BASE_ALPHA
  const overlayStyle = {
    '--woon-drawer-overlay-alpha': String(overlayAlpha),
    transition: `opacity 160ms ease-out, background-color ${dragVisualState.transition ?? '0ms linear'}`,
    ...style,
  } as React.CSSProperties

  return <Dialog.Overlay data-woon-drawer-overlay style={overlayStyle} {...overlayProps} />
}

export function DrawerContent(props: DrawerContentProps) {
  const {
    style,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClickCapture,
    ...contentProps
  } = props
  const { direction, dragToClose, setDragVisualState } = useDrawerContext()
  const drag = useBottomDragToClose({ direction, dragToClose, setDragVisualState })

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    onPointerDown?.(event)
    if (event.defaultPrevented) return
    drag.handlers.onPointerDown(event)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event)
    if (event.defaultPrevented) return
    drag.handlers.onPointerMove(event)
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    onPointerUp?.(event)
    if (event.defaultPrevented) return
    drag.handlers.onPointerUp(event)
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLDivElement>) {
    onPointerCancel?.(event)
    if (event.defaultPrevented) return
    drag.handlers.onPointerCancel(event)
  }

  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    drag.handlers.onClickCapture(event)
    if (event.defaultPrevented) return
    onClickCapture?.(event)
  }

  return (
    <Dialog.Content
      data-woon-drawer-content
      data-direction={direction}
      data-dragging={drag.isDragging || undefined}
      data-drag-closing={drag.isDragClosing || undefined}
      style={{ ...style, ...drag.dragStyle }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
      {...contentProps}
    />
  )
}

export function DrawerHandle(props: DrawerHandleProps) {
  return <div data-woon-drawer-handle aria-hidden="true" {...props} />
}

export function DrawerTitle(props: DrawerTitleProps) {
  return <Dialog.Title data-woon-drawer-title {...props} />
}

export function DrawerDescription(props: DrawerDescriptionProps) {
  return <Dialog.Description data-woon-drawer-description {...props} />
}

export function DrawerClose(props: DrawerCloseProps) {
  return <Dialog.Close data-woon-drawer-close {...props} />
}

export type DrawerComponents = {
  Root: React.ComponentType<DrawerRootProps>
  Overlay: React.ComponentType<DrawerOverlayProps>
  Content: React.ComponentType<DrawerContentProps>
  Handle: React.ComponentType<DrawerHandleProps>
  Title: React.ComponentType<DrawerTitleProps>
  Description: React.ComponentType<DrawerDescriptionProps>
  Close: React.ComponentType<DrawerCloseProps>
}

export const Drawer: DrawerComponents = {
  Root: DrawerRoot,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Handle: DrawerHandle,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
}

export type { DrawerRootProps }
