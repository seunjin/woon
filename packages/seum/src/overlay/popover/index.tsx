import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import { useCallback, useEffect, useId, useLayoutEffect, useState } from 'react'
import { popEscapeHandler, pushEscapeHandler } from '../../core/overlay-engine/escape-stack'
import { Portal } from '../../core/overlay-engine/portal'
import { createSafeContext } from '../../core/shared/create-safe-context'
import { Slot } from '../../core/shared/slot'

// ─── Types ────────────────────────────────────────────────────────────────────

type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
type PopoverAlign = 'start' | 'center' | 'end'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * 팝오버 애니메이션 transform-origin 계산.
 * 원칙: 트리거가 있는 방향 = scale이 시작되는 지점.
 *
 * side='bottom' → 트리거는 위쪽 → transform-origin top
 * align='start' → 트리거는 왼쪽(수직 side) or 위쪽(수평 side) 정렬
 */
function getTransformOrigin(side: string, align: PopoverAlign): string {
  const mainOrigin: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  }
  const main = mainOrigin[side] ?? 'center'

  if (align === 'center') return `${main} center`

  // 수직 side(top/bottom)의 cross축은 수평(left/right)
  // 수평 side(left/right)의 cross축은 수직(top/bottom)
  const isVerticalSide = side === 'top' || side === 'bottom'
  const crossStart = isVerticalSide ? 'left' : 'top'
  const crossEnd = isVerticalSide ? 'right' : 'bottom'

  return `${main} ${align === 'start' ? crossStart : crossEnd}`
}

// ─── Context ──────────────────────────────────────────────────────────────────

type PopoverContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  referenceEl: Element | null
  setReferenceEl: (el: Element | null) => void
  contentId: string
}

const [PopoverContext, usePopoverContext] = createSafeContext<PopoverContextValue>('Popover')

// ─── Popover.Root ─────────────────────────────────────────────────────────────

type PopoverRootProps = {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function PopoverRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: PopoverRootProps) {
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

  const [referenceEl, setReferenceEl] = useState<Element | null>(null)
  const contentId = useId()

  return (
    <PopoverContext value={{ open, setOpen, referenceEl, setReferenceEl, contentId }}>
      {children}
    </PopoverContext>
  )
}

// ─── Popover.Trigger ──────────────────────────────────────────────────────────

type PopoverTriggerProps = {
  children: React.ReactNode
  asChild?: boolean
}

function PopoverTrigger({ children, asChild = false }: PopoverTriggerProps) {
  const { open, setOpen, setReferenceEl, contentId } = usePopoverContext()

  const triggerProps = {
    ref: (el: Element | null) => setReferenceEl(el),
    'aria-expanded': open,
    'aria-controls': open ? contentId : undefined,
    'aria-haspopup': 'dialog' as const,
    onClick: () => setOpen(!open),
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

// ─── Popover.Content ─────────────────────────────────────────────────────────

type PopoverContentProps = {
  children?: React.ReactNode
  side?: PopoverSide
  align?: PopoverAlign
  sideOffset?: number
  alignOffset?: number
  avoidCollisions?: boolean
  collisionPadding?: number
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'id'>

function PopoverContent({
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 6,
  alignOffset = 0,
  avoidCollisions = true,
  collisionPadding = 8,
  style,
  ...props
}: PopoverContentProps) {
  const { open, setOpen, referenceEl, contentId } = usePopoverContext()

  const placement = (align === 'center' ? side : `${side}-${align}`) as Placement

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    elements: { reference: referenceEl },
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

  // 외부 클릭 닫기 — ESC는 escape-stack으로 별도 처리
  const dismiss = useDismiss(context, { escapeKey: false })
  const { getFloatingProps } = useInteractions([dismiss])

  // ESC — overlay-engine escape-stack에 등록 (dialog와 스택 공유)
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    pushEscapeHandler(handler)
    return () => popEscapeHandler(handler)
  }, [open, setOpen])

  // 실제 배치된 side 추출 (flip 후 달라질 수 있음)
  const actualSide = (context.placement ?? placement).split('-')[0] as PopoverSide

  // isPositioned → 브라우저 페인트 후 애니메이션 시작
  // floatingStyles가 transform:translate() 방식이라 isPositioned와 페인트 사이에
  // 한 프레임 차이가 있음. rAF로 실제 페인트 이후 visible 전환.
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

  // 포지셔닝(translate)과 scale 애니메이션을 분리.
  // 같은 요소에 translate + scale이 있으면 transform-origin이 translate에도
  // 영향을 미쳐 위치가 어긋나 보임. 외부 div는 위치만, 내부 div는 애니메이션만.
  return (
    <Portal>
      <div
        ref={refs.setFloating}
        style={{
          ...floatingStyles,
          // visible 전까지 숨김 — 위치 계산 전 (0,0)에서 깜빡임 방지
          visibility: visible ? undefined : 'hidden',
        }}
      >
        <div
          id={contentId}
          role="dialog"
          data-seum-popover-content=""
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

// ─── Popover.Close ────────────────────────────────────────────────────────────

type PopoverCloseProps = {
  children: React.ReactNode
  asChild?: boolean
}

function PopoverClose({ children, asChild = false }: PopoverCloseProps) {
  const { setOpen } = usePopoverContext()

  const closeProps = { onClick: () => setOpen(false) }

  if (asChild) {
    return <Slot {...closeProps}>{children}</Slot>
  }

  return (
    <button type="button" {...closeProps}>
      {children}
    </button>
  )
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose,
}

export type { PopoverAlign, PopoverSide }
export { usePopoverContext }
