import {
  arrow,
  autoUpdate,
  FloatingArrow,
  type FloatingArrowProps,
  flip,
  offset,
  type Placement,
  shift,
  useFloating,
} from '@floating-ui/react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Portal } from '../../core/overlay-engine/portal'
import { createSafeContext } from '../../core/shared/create-safe-context'
import { getTransformOrigin } from '../../core/shared/get-transform-origin'
import { Slot } from '../../core/shared/slot'

// ─── Types ────────────────────────────────────────────────────────────────────

type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
type TooltipAlign = 'start' | 'center' | 'end'
type TooltipDelay = number | { open?: number; close?: number }

// ─── Context ──────────────────────────────────────────────────────────────────

type TooltipContextValue = {
  open: boolean
  setReference: (el: Element | null) => void
  setFloating: (el: HTMLElement | null) => void
  floatingStyles: React.CSSProperties
  floatingContext: ReturnType<typeof useFloating>['context']
  placement: Placement
  isPositioned: boolean
  onPointerEnter: () => void
  onPointerLeave: () => void
  onFocus: () => void
  onBlur: () => void
  floatingId: string
  arrowRef: React.RefObject<SVGSVGElement | null>
  side: TooltipSide
  align: TooltipAlign
}

const [TooltipContext, useTooltipContext] = createSafeContext<TooltipContextValue>('Tooltip')

// ─── Tooltip.Root ─────────────────────────────────────────────────────────────

type TooltipRootProps = {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: TooltipSide
  align?: TooltipAlign
  sideOffset?: number
  alignOffset?: number
  avoidCollisions?: boolean
  collisionPadding?: number
  /** hover 딜레이. 숫자면 open 딜레이(ms). 기본 500ms */
  delay?: TooltipDelay
}

function TooltipRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  alignOffset = 0,
  avoidCollisions = true,
  collisionPadding = 8,
  delay = 500,
}: TooltipRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const openDelay = typeof delay === 'number' ? delay : (delay.open ?? 0)
  const closeDelay = typeof delay === 'number' ? 0 : (delay.close ?? 0)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const arrowRef = useRef<SVGSVGElement>(null)

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const placement = (align === 'center' ? side : `${side}-${align}`) as Placement

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [
      offset({ mainAxis: sideOffset, crossAxis: alignOffset }),
      ...(avoidCollisions
        ? [flip({ padding: collisionPadding }), shift({ padding: collisionPadding })]
        : []),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  })

  const floatingId = useId()

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const scheduleOpen = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    if (openDelay === 0) {
      setOpen(true)
    } else {
      openTimerRef.current = setTimeout(() => setOpen(true), openDelay)
    }
  }, [openDelay, setOpen])

  const scheduleClose = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    if (closeDelay === 0) {
      setOpen(false)
    } else {
      closeTimerRef.current = setTimeout(() => setOpen(false), closeDelay)
    }
  }, [closeDelay, setOpen])

  return (
    <TooltipContext
      value={{
        open,
        setReference: refs.setReference,
        setFloating: refs.setFloating,
        floatingStyles,
        floatingContext: context,
        placement: context.placement,
        isPositioned,
        onPointerEnter: scheduleOpen,
        onPointerLeave: scheduleClose,
        onFocus: scheduleOpen,
        onBlur: scheduleClose,
        floatingId,
        arrowRef,
        side,
        align,
      }}
    >
      {children}
    </TooltipContext>
  )
}

// ─── Tooltip.Trigger ──────────────────────────────────────────────────────────

type TooltipTriggerProps = {
  children: React.ReactNode
  asChild?: boolean
}

function TooltipTrigger({ children, asChild = false }: TooltipTriggerProps) {
  const { setReference, onPointerEnter, onPointerLeave, onFocus, onBlur, floatingId } =
    useTooltipContext()

  const triggerProps = {
    ref: setReference,
    'aria-describedby': floatingId,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
  }

  if (asChild) {
    return <Slot {...triggerProps}>{children}</Slot>
  }

  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  )
}

// ─── Tooltip.Content ──────────────────────────────────────────────────────────

type TooltipContentProps = {
  children?: React.ReactNode
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'id'>

function TooltipContent({ children, style, ...props }: TooltipContentProps) {
  const { open, setFloating, floatingStyles, isPositioned, placement, floatingId, align } =
    useTooltipContext()

  const actualSide = placement.split('-')[0] as TooltipSide

  if (!open) return null

  return (
    <Portal>
      <div
        ref={setFloating}
        data-seum-tooltip-floating=""
        style={{ ...floatingStyles, visibility: isPositioned ? undefined : 'hidden' }}
      >
        <div
          id={floatingId}
          role="tooltip"
          data-seum-tooltip-content=""
          data-state={isPositioned ? 'open' : undefined}
          data-side={actualSide}
          data-align={align}
          style={{ transformOrigin: getTransformOrigin(actualSide, align), ...style }}
          {...props}
        >
          {children}
        </div>
      </div>
    </Portal>
  )
}

// ─── Tooltip.Arrow ────────────────────────────────────────────────────────────

type TooltipArrowProps = Omit<FloatingArrowProps, 'ref' | 'context'>

function TooltipArrow({ width = 12, height = 6, ...props }: TooltipArrowProps) {
  const { arrowRef, floatingContext } = useTooltipContext()

  return (
    <FloatingArrow
      ref={arrowRef}
      context={floatingContext}
      width={width}
      height={height}
      data-seum-tooltip-arrow=""
      {...props}
    />
  )
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
}

export type { TooltipAlign, TooltipDelay, TooltipSide }
export { useTooltipContext }
