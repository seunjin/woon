import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { useCallback, useLayoutEffect, useState } from 'react'
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
  refs: ReturnType<typeof useFloating>['refs']
  floatingStyles: React.CSSProperties
  context: ReturnType<typeof useFloating>['context']
  isPositioned: boolean
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps']
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps']
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

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const placement = (align === 'center' ? side : `${side}-${align}`) as Placement
  const delayOption = typeof delay === 'number' ? { open: delay, close: 0 } : delay

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [
      offset({ mainAxis: sideOffset, crossAxis: alignOffset }),
      ...(avoidCollisions
        ? [flip({ padding: collisionPadding }), shift({ padding: collisionPadding })]
        : []),
    ],
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context, { delay: delayOption, move: false })
  const focus = useFocus(context)
  // role='tooltip' → floating에 role="tooltip", trigger에 aria-describedby 자동 주입
  const role = useRole(context, { role: 'tooltip' })

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, role])

  return (
    <TooltipContext
      value={{
        open,
        refs,
        floatingStyles,
        context,
        isPositioned,
        getReferenceProps,
        getFloatingProps,
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
  const { refs, getReferenceProps } = useTooltipContext()

  // getReferenceProps가 aria-describedby 포함 (useRole이 자동 주입)
  const triggerProps = getReferenceProps({ ref: refs.setReference })

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
  const { open, refs, floatingStyles, getFloatingProps, context, isPositioned, side, align } =
    useTooltipContext()

  // flip 후 실제 배치된 side 추출
  const actualSide = (context.placement ?? (align === 'center' ? side : `${side}-${align}`)).split(
    '-',
  )[0] as TooltipSide

  // Popover와 동일하게 rAF로 페인트 후 애니메이션 시작
  const [visible, setVisible] = useState(false)
  useLayoutEffect(() => {
    if (!isPositioned) {
      setVisible(false)
      return
    }
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [isPositioned])

  if (!open) return null

  return (
    <Portal>
      <div
        ref={refs.setFloating}
        data-seum-tooltip-floating=""
        style={{ ...floatingStyles, visibility: visible ? undefined : 'hidden' }}
      >
        <div
          data-seum-tooltip-content=""
          data-state={visible ? 'open' : undefined}
          data-side={actualSide}
          data-align={align}
          style={{ transformOrigin: getTransformOrigin(actualSide, align), ...style }}
          {...getFloatingProps(props)}
        >
          {children}
        </div>
      </div>
    </Portal>
  )
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
}

export type { TooltipAlign, TooltipDelay, TooltipSide }
export { useTooltipContext }
