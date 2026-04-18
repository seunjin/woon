import {
  autoUpdate,
  FloatingFocusManager,
  FloatingList,
  flip,
  offset,
  type Placement,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListItem,
  useListNavigation,
  useRole,
  useTypeahead,
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
import {
  type CSSProperties,
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left'
type DropdownMenuAlign = 'start' | 'center' | 'end'

// ─── Context ──────────────────────────────────────────────────────────────────

type DropdownMenuContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  activeIndex: number | null
  setActiveIndex: Dispatch<SetStateAction<number | null>>
  elementsRef: RefObject<(HTMLElement | null)[]>
  labelsRef: RefObject<(string | null)[]>
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps']
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps']
  getItemProps: ReturnType<typeof useInteractions>['getItemProps']
  refs: ReturnType<typeof useFloating>['refs']
  floatingStyles: CSSProperties
  context: ReturnType<typeof useFloating>['context']
  isPositioned: boolean
  actualSide: DropdownMenuSide
  align: DropdownMenuAlign
  contentId: string
}

const [DropdownMenuContext, useDropdownMenuContext] =
  createSafeContext<DropdownMenuContextValue>('DropdownMenu')

// ─── DropdownMenu.Root ────────────────────────────────────────────────────────

// 포지셔닝 설정은 Root에 위치한다.
// DropdownMenu는 Popover와 달리 useListNavigation·useTypeahead 등 상호작용 훅을
// Item과 공유해야 하므로 모든 Floating UI 훅을 Root에서 호출한다.

type DropdownMenuRootProps = {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** 메뉴가 열리는 방향. 기본값 'bottom' */
  side?: DropdownMenuSide
  /** 트리거 기준 정렬. 기본값 'start' */
  align?: DropdownMenuAlign
  /** 트리거와의 간격(px). 기본값 4 */
  sideOffset?: number
  /** 정렬 축 오프셋(px). 기본값 0 */
  alignOffset?: number
}

function DropdownMenuRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
}: DropdownMenuRootProps) {
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

  const contentId = useId()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const elementsRef = useRef<(HTMLElement | null)[]>([])
  const labelsRef = useRef<(string | null)[]>([])

  const placement = (align === 'center' ? side : `${side}-${align}`) as Placement

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [
      offset({ mainAxis: sideOffset, crossAxis: alignOffset }),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  })

  const click = useClick(context)
  const dismiss = useDismiss(context, { escapeKey: false })
  const role = useRole(context, { role: 'menu' })
  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  })
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: setActiveIndex,
  })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
    typeahead,
  ])

  const actualSide = (context.placement ?? placement).split('-')[0] as DropdownMenuSide

  return (
    <DropdownMenuContext
      value={{
        open,
        setOpen,
        activeIndex,
        setActiveIndex,
        elementsRef,
        labelsRef,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        refs,
        floatingStyles,
        context,
        isPositioned,
        actualSide,
        align,
        contentId,
      }}
    >
      {children}
    </DropdownMenuContext>
  )
}

// ─── DropdownMenu.Trigger ─────────────────────────────────────────────────────

type DropdownMenuTriggerProps = {
  children: React.ReactNode
  asChild?: boolean
}

function DropdownMenuTrigger({ children, asChild = false }: DropdownMenuTriggerProps) {
  const { open, contentId, refs, getReferenceProps } = useDropdownMenuContext()

  const triggerProps = getReferenceProps({
    ref: refs.setReference,
    'aria-controls': open ? contentId : undefined,
  })

  if (asChild) {
    return <Slot {...triggerProps}>{children}</Slot>
  }

  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  )
}

// ─── DropdownMenu.Content ─────────────────────────────────────────────────────

type DropdownMenuContentProps = {
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
}

function DropdownMenuContent({ children, style, ...props }: DropdownMenuContentProps) {
  const {
    open,
    setOpen,
    elementsRef,
    labelsRef,
    getFloatingProps,
    refs,
    floatingStyles,
    context,
    isPositioned,
    actualSide,
    align,
    contentId,
  } = useDropdownMenuContext()
  const zIndex = useFloatingZIndex(500)

  // ESC — overlay-engine escape-stack에 등록 (Dialog와 스택 공유)
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    pushEscapeHandler(handler)
    return () => popEscapeHandler(handler)
  }, [open, setOpen])

  // isPositioned → 브라우저 페인트 후 애니메이션 시작 (Popover와 동일한 패턴)
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

  return (
    <Portal>
      {/* 외부 div: 포지셔닝(translate)만 담당 */}
      <div
        ref={refs.setFloating}
        data-woon-dropdown-menu-floating=""
        style={{
          ...floatingStyles,
          zIndex,
          visibility: visible ? undefined : 'hidden',
        }}
      >
        {visible && (
          <FloatingFocusManager context={context} modal={false}>
            {/* 내부 div: 시각 스타일 + 진입 애니메이션 담당 */}
            <div
              id={contentId}
              role="menu"
              data-woon-dropdown-menu-content=""
              data-state="open"
              data-entered={entered || undefined}
              data-side={actualSide}
              data-align={align}
              style={{ transformOrigin: getTransformOrigin(actualSide, align), ...style }}
              {...getFloatingProps(props)}
            >
              {/* FloatingList: Item이 elementsRef·labelsRef에 자신을 자동 등록 */}
              <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                {children}
              </FloatingList>
            </div>
          </FloatingFocusManager>
        )}
      </div>
    </Portal>
  )
}

// ─── DropdownMenu.Item ────────────────────────────────────────────────────────

type DropdownMenuItemProps = {
  children: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
  asChild?: boolean
  /** typeahead용 텍스트. children이 문자열이면 자동 추출되므로 보통 불필요 */
  textValue?: string
  className?: string
  style?: CSSProperties
}

function DropdownMenuItem({
  children,
  onSelect,
  disabled = false,
  asChild = false,
  textValue,
  ...props
}: DropdownMenuItemProps) {
  const { activeIndex, setOpen, getItemProps } = useDropdownMenuContext()

  // typeahead 레이블: textValue > string children > null(비활성)
  const label = disabled ? null : (textValue ?? (typeof children === 'string' ? children : null))

  const { ref, index } = useListItem({ label })

  const isActive = activeIndex === index

  const handleSelect = () => {
    if (disabled) return
    onSelect?.()
    setOpen(false)
  }

  const itemProps = getItemProps({
    ref,
    tabIndex: isActive ? 0 : -1,
    onClick: disabled ? undefined : handleSelect,
    onKeyDown: disabled
      ? undefined
      : (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelect()
          }
        },
    ...props,
  })

  const itemAttrs = {
    role: 'menuitem' as const,
    'aria-disabled': disabled || undefined,
    'data-woon-dropdown-menu-item': '',
    'data-disabled': disabled ? ('' as const) : undefined,
    'data-highlighted': isActive ? ('' as const) : undefined,
    ...itemProps,
  }

  if (asChild) {
    return <Slot {...itemAttrs}>{children}</Slot>
  }

  return <div {...itemAttrs}>{children}</div>
}

// ─── DropdownMenu.Separator ───────────────────────────────────────────────────

type DropdownMenuSeparatorProps = {
  className?: string
}

function DropdownMenuSeparator(props: DropdownMenuSeparatorProps) {
  // biome-ignore lint/a11y/useSemanticElements: menu separator uses div for consistent box model with data attribute styling
  // biome-ignore lint/a11y/useFocusableInteractive: menu separators are intentionally non-focusable
  // biome-ignore lint/a11y/useAriaPropsForRole: aria-valuenow is for splitter role, not menu separator
  return <div role="separator" data-woon-dropdown-menu-separator="" {...props} />
}

// ─── DropdownMenu.Label ───────────────────────────────────────────────────────

type DropdownMenuLabelProps = {
  children: React.ReactNode
  className?: string
}

function DropdownMenuLabel({ children, ...props }: DropdownMenuLabelProps) {
  return (
    <div data-woon-dropdown-menu-label="" {...props}>
      {children}
    </div>
  )
}

// ─── DropdownMenu.Group ───────────────────────────────────────────────────────

type DropdownMenuGroupProps = {
  children: React.ReactNode
  className?: string
}

function DropdownMenuGroup({ children, ...props }: DropdownMenuGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: menu group uses div for consistent data attribute styling
    <div role="group" data-woon-dropdown-menu-group="" {...props}>
      {children}
    </div>
  )
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export const DropdownMenu = {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
  Label: DropdownMenuLabel,
  Group: DropdownMenuGroup,
}

export type { DropdownMenuAlign, DropdownMenuSide }
export { useDropdownMenuContext }
