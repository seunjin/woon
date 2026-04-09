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
  setPlacement: (p: Placement) => void
}

const [TooltipContext, useTooltipContext] = createSafeContext<TooltipContextValue>('Tooltip')

// ─── Tooltip.Root ─────────────────────────────────────────────────────────────

type TooltipRootProps = {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** hover 딜레이. 숫자면 open 딜레이(ms). 기본 500ms. close는 0ms. */
  delay?: TooltipDelay
}

function TooltipRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
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

  // Content가 mount 시 자신의 side/align으로 업데이트
  const [placement, setPlacement] = useState<Placement>('top')

  const delayOption = typeof delay === 'number' ? { open: delay, close: 0 } : delay

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context, { delay: delayOption, move: false })
  const focus = useFocus(context)
  // role='tooltip' → floating에 role="tooltip", trigger에 aria-describedby 자동 설정
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
        setPlacement,
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
  side?: TooltipSide
  align?: TooltipAlign
  sideOffset?: number
  alignOffset?: number
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'id'>

function TooltipContent({
  children,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  alignOffset = 0,
  style,
  ...props
}: TooltipContentProps) {
  const { open, refs, floatingStyles, getFloatingProps, isPositioned, setPlacement } =
    useTooltipContext()

  // Root의 placement 상태를 Content의 side/align으로 동기화.
  // Content는 항상 DOM에 존재하므로 첫 hover 전에 이미 placement가 설정됨.
  useLayoutEffect(() => {
    const p = (align === 'center' ? side : `${side}-${align}`) as Placement
    setPlacement(p)
  }, [side, align, setPlacement])

  // flip 후 실제 side 추출
  const actualSide = (
    refs.floating.current ? (refs.floating.current.getAttribute('data-side') ?? side) : side
  ) as TooltipSide

  const visible = open && isPositioned

  // Tooltip content는 항상 DOM에 존재해야 함 (aria-describedby 참조용).
  // visibility로 표시 여부만 제어.
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
