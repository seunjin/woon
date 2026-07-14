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
import { canStartCloseDrag } from './drag'

const AXIS_LOCK_THRESHOLD = 8
const CLOSE_DISTANCE_RATIO = 0.25
const CLOSE_VELOCITY_THRESHOLD = 0.6
const DEFAULT_DRAG_DURATION_MS = 280
const OVERLAY_BASE_ALPHA = 0.52
const IDLE_DRAG_VISUAL_STATE: DrawerDragVisualState = {
  progress: 0,
  phase: 'idle',
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
  phase: 'dragging' | 'resetting' | 'closing'
}

type DragSession = {
  pointerId: number
  startX: number
  startY: number
  startTime: number
  target: EventTarget | null
  status: 'pending' | 'dragging' | 'blocked'
}

function isVerticalDragDirection(direction: DrawerDirection): direction is 'top' | 'bottom' {
  return direction === 'top' || direction === 'bottom'
}

function getAxis(direction: DrawerDirection) {
  return isVerticalDragDirection(direction) ? 'y' : 'x'
}

function getCloseDirectionDelta(direction: DrawerDirection, deltaX: number, deltaY: number) {
  switch (direction) {
    case 'bottom':
      return deltaY
    case 'top':
      return -deltaY
    case 'right':
      return deltaX
    case 'left':
      return -deltaX
  }
}

function getDragOffset(direction: DrawerDirection, deltaX: number, deltaY: number) {
  return Math.max(0, getCloseDirectionDelta(direction, deltaX, deltaY))
}

function getTransform(direction: DrawerDirection, offset: number) {
  switch (direction) {
    case 'bottom':
      return `translate3d(0, ${offset}px, 0)`
    case 'top':
      return `translate3d(0, ${-offset}px, 0)`
    case 'right':
      return `translate3d(${offset}px, 0, 0)`
    case 'left':
      return `translate3d(${-offset}px, 0, 0)`
  }
}

function getContentSize(direction: DrawerDirection, contentElement: HTMLDivElement) {
  const rect = contentElement.getBoundingClientRect()
  return Math.max(isVerticalDragDirection(direction) ? rect.height : rect.width, 1)
}

function parseCssTimeToMs(value: string) {
  const match = value.trim().match(/^(-?\d*\.?\d+)(ms|s)$/)
  if (!match) return null

  const amount = Number(match[1])
  if (!Number.isFinite(amount)) return null

  return Math.max(match[2] === 's' ? amount * 1000 : amount, 0)
}

function getCssDuration(
  element: HTMLElement,
  customProperties: readonly string[],
  fallbackMs: number,
) {
  const style = window.getComputedStyle(element)

  for (const property of customProperties) {
    const duration = parseCssTimeToMs(style.getPropertyValue(property))
    if (duration !== null) return duration
  }

  return fallbackMs
}

function useDragToClose({
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
  const axis = getAxis(direction)
  const canInteract = dragToClose && dialog.status === 'open'

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

  function scheduleReset(contentElement: HTMLDivElement) {
    const resetDuration = getCssDuration(
      contentElement,
      [
        '--woon-drawer-content-drag-reset-duration',
        '--woon-drawer-drag-reset-duration',
        '--woon-drawer-duration',
      ],
      DEFAULT_DRAG_DURATION_MS,
    )

    setIsDragging(false)
    setDragMotion({
      offset: 0,
      phase: 'resetting',
    })
    setDragVisualState({
      progress: 0,
      phase: 'resetting',
    })

    timerRef.current = window.setTimeout(() => {
      setDragMotion(null)
      setIsDragging(false)
      setDragVisualState(IDLE_DRAG_VISUAL_STATE)
      timerRef.current = null
    }, resetDuration)
  }

  function scheduleClose(contentElement: HTMLDivElement) {
    const contentSize = getContentSize(direction, contentElement)
    const closeDuration = getCssDuration(
      contentElement,
      [
        '--woon-drawer-content-drag-close-duration',
        '--woon-drawer-drag-close-duration',
        '--woon-drawer-duration',
      ],
      DEFAULT_DRAG_DURATION_MS,
    )

    setIsDragging(false)
    setIsDragClosing(true)
    setDragMotion({
      offset: contentSize,
      phase: 'closing',
    })
    setDragVisualState({
      progress: 1,
      phase: 'closing',
    })

    timerRef.current = window.setTimeout(() => {
      dialog.close()
      timerRef.current = null
    }, closeDuration)
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
    const axisDelta = axis === 'y' ? deltaY : deltaX
    const crossAxisDelta = axis === 'y' ? deltaX : deltaY
    const closeDirectionDelta = getCloseDirectionDelta(direction, deltaX, deltaY)

    if (session.status === 'pending') {
      if (Math.abs(deltaX) < AXIS_LOCK_THRESHOLD && Math.abs(deltaY) < AXIS_LOCK_THRESHOLD) {
        return
      }

      if (Math.abs(axisDelta) <= Math.abs(crossAxisDelta) || closeDirectionDelta <= 0) {
        session.status = 'blocked'
        return
      }

      if (!canStartCloseDrag(direction, session.target, event.currentTarget)) {
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

    const offset = getDragOffset(direction, deltaX, deltaY)
    const contentHeight = getContentSize(direction, event.currentTarget)
    suppressClickRef.current = offset > AXIS_LOCK_THRESHOLD
    setDragMotion({ offset, phase: 'dragging' })
    setDragVisualState({
      progress: getDragProgress(offset, contentHeight),
      phase: 'dragging',
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

    const distance = getDragOffset(
      direction,
      event.clientX - session.startX,
      event.clientY - session.startY,
    )
    const duration = Math.max(performance.now() - session.startTime, 1)
    const velocity = distance / duration
    const contentHeight = getContentSize(direction, contentElement)
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

    scheduleReset(contentElement)
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

      scheduleReset(contentElement)
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
        transform: getTransform(direction, dragMotion.offset),
      }
    : undefined

  return {
    dragStyle,
    isDragging,
    isDragClosing,
    isDragResetting: dragMotion?.phase === 'resetting',
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
  const { dragToClose, dragVisualState } = useDrawerContext()
  const overlayAlpha = dragToClose
    ? OVERLAY_BASE_ALPHA * (1 - dragVisualState.progress)
    : OVERLAY_BASE_ALPHA
  const overlayStyle = {
    '--woon-drawer-overlay-alpha': String(overlayAlpha),
    ...style,
  } as React.CSSProperties

  return (
    <Dialog.Overlay
      data-woon-drawer-overlay
      data-woon-dialog-overlay={undefined}
      data-dragging={dragVisualState.phase === 'dragging' || undefined}
      data-drag-resetting={dragVisualState.phase === 'resetting' || undefined}
      data-drag-closing={dragVisualState.phase === 'closing' || undefined}
      style={overlayStyle}
      {...overlayProps}
    />
  )
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
  const drag = useDragToClose({ direction, dragToClose, setDragVisualState })

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
      data-woon-dialog-content={undefined}
      data-direction={direction}
      data-dragging={drag.isDragging || undefined}
      data-drag-resetting={drag.isDragResetting || undefined}
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
  return <Dialog.Title data-woon-drawer-title data-woon-dialog-title={undefined} {...props} />
}

export function DrawerDescription(props: DrawerDescriptionProps) {
  return (
    <Dialog.Description
      data-woon-drawer-description
      data-woon-dialog-description={undefined}
      {...props}
    />
  )
}

export function DrawerClose(props: DrawerCloseProps) {
  return <Dialog.Close data-woon-drawer-close data-woon-dialog-close={undefined} {...props} />
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
