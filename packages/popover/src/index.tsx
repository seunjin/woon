import {
  autoUpdate,
  FloatingFocusManager,
  flip,
  offset,
  type Placement,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import {
  createSafeContext,
  getTransformOrigin,
  Portal,
  popEscapeHandler,
  pushEscapeHandler,
  Slot,
  useFloatingZIndex,
} from '@woon-ui/primitive'
import { useCallback, useEffect, useId, useLayoutEffect, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
type PopoverAlign = 'start' | 'center' | 'end'

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
  /** true면 포커스 트랩 (내부에서만 Tab). false면 Tab으로 밖에 나가면 닫힘. 기본값 false */
  trapFocus?: boolean
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'id'>

function PopoverContent({
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 6,
  alignOffset = 0,
  avoidCollisions = true,
  collisionPadding = 8,
  trapFocus = false,
  style,
  ...props
}: PopoverContentProps) {
  const { open, setOpen, referenceEl, contentId } = usePopoverContext()
  const zIndex = useFloatingZIndex(500)

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

  const [entered, setEntered] = useState(false)
  useEffect(() => {
    if (!visible) {
      setEntered(false)
      return
    }
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [visible])

  if (!open) return null

  // 포지셔닝(translate)과 scale 애니메이션을 분리.
  // 같은 요소에 translate + scale이 있으면 transform-origin이 translate에도
  // 영향을 미쳐 위치가 어긋나 보임. 외부 div는 위치만, 내부 div는 애니메이션만.
  //
  // FloatingFocusManager는 visible 이후에만 마운트:
  // - 마운트 시 내부 첫 번째 포커스 가능 요소로 자동 포커스
  // - 언마운트(open=false) 시 트리거로 포커스 복귀
  // - modal={false}: 소프트 포커스 관리 (Tab으로 밖으로 나가면 닫힘)
  return (
    <Portal>
      <div
        ref={refs.setFloating}
        data-woon-popover-floating=""
        style={{
          ...floatingStyles,
          zIndex,
          // visible 전까지 숨김 — 위치 계산 전 (0,0)에서 깜빡임 방지
          visibility: visible ? undefined : 'hidden',
        }}
      >
        {visible && (
          <FloatingFocusManager context={context} modal={trapFocus}>
            <div
              id={contentId}
              role="dialog"
              data-woon-popover-content=""
              data-state="open"
              data-entered={entered || undefined}
              data-side={actualSide}
              data-align={align}
              style={{ transformOrigin: getTransformOrigin(actualSide, align), ...style }}
              {...getFloatingProps(props)}
            >
              {children}
            </div>
          </FloatingFocusManager>
        )}
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
