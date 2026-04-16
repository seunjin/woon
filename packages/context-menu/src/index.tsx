import {
  FloatingFocusManager,
  FloatingList,
  flip,
  shift,
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

type ContextMenuSide = 'top' | 'right' | 'bottom' | 'left'

// ─── Context ──────────────────────────────────────────────────────────────────

type ContextMenuContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  activeIndex: number | null
  setActiveIndex: Dispatch<SetStateAction<number | null>>
  elementsRef: RefObject<(HTMLElement | null)[]>
  labelsRef: RefObject<(string | null)[]>
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps']
  getItemProps: ReturnType<typeof useInteractions>['getItemProps']
  refs: ReturnType<typeof useFloating>['refs']
  floatingStyles: CSSProperties
  context: ReturnType<typeof useFloating>['context']
  isPositioned: boolean
  actualSide: ContextMenuSide
  contentId: string
}

const [ContextMenuContext, useContextMenuContext] =
  createSafeContext<ContextMenuContextValue>('ContextMenu')

// ─── ContextMenu.Root ─────────────────────────────────────────────────────────

// ContextMenu는 커서 위치에 열리므로 포지셔닝 props가 없다.
// 우클릭 시 refs.setPositionReference()로 가상 레퍼런스를 설정하고,
// refs.setReference()로는 실제 Trigger DOM을 연결한다.
// — 포지셔닝: 가상 레퍼런스 (커서 좌표)
// — 포커스 복귀: 실제 Trigger DOM (FloatingFocusManager)

type ContextMenuRootProps = {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function ContextMenuRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: ContextMenuRootProps) {
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

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    placement: 'bottom-start',
    open,
    onOpenChange: setOpen,
    middleware: [
      // offset 없음 — 커서 바로 옆에서 열림
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
    // autoUpdate 없음 — 컨텍스트 메뉴는 열린 시점 위치 고정
  })

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

  const { getFloatingProps, getItemProps } = useInteractions([dismiss, role, listNav, typeahead])

  const actualSide = (context.placement ?? 'bottom-start').split('-')[0] as ContextMenuSide

  return (
    <ContextMenuContext
      value={{
        open,
        setOpen,
        activeIndex,
        setActiveIndex,
        elementsRef,
        labelsRef,
        getFloatingProps,
        getItemProps,
        refs,
        floatingStyles,
        context,
        isPositioned,
        actualSide,
        contentId,
      }}
    >
      {children}
    </ContextMenuContext>
  )
}

// ─── ContextMenu.Trigger ──────────────────────────────────────────────────────

type ContextMenuTriggerProps = {
  children: React.ReactNode
  asChild?: boolean
}

function ContextMenuTrigger({ children, asChild = false }: ContextMenuTriggerProps) {
  const { setOpen, refs } = useContextMenuContext()

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const x = e.clientX
      const y = e.clientY
      // 커서 위치를 가상 레퍼런스로 설정 — 포지셔닝에 사용
      // refs.setReference는 Trigger DOM에 연결된 채로 유지 (포커스 복귀용)
      refs.setPositionReference({
        getBoundingClientRect: () => ({
          width: 0,
          height: 0,
          x,
          y,
          top: y,
          left: x,
          right: x,
          bottom: y,
        }),
      })
      setOpen(true)
    },
    [refs, setOpen],
  )

  const triggerProps = {
    ref: refs.setReference,
    onContextMenu: handleContextMenu,
  }

  if (asChild) {
    return <Slot {...triggerProps}>{children}</Slot>
  }

  return (
    <div data-woon-context-menu-trigger="" {...triggerProps}>
      {children}
    </div>
  )
}

// ─── ContextMenu.Content ──────────────────────────────────────────────────────

type ContextMenuContentProps = {
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
}

function ContextMenuContent({ children, style, ...props }: ContextMenuContentProps) {
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
    contentId,
  } = useContextMenuContext()
  const zIndex = useFloatingZIndex(500)

  // ESC — overlay-engine escape-stack에 등록 (Dialog와 스택 공유)
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    pushEscapeHandler(handler)
    return () => popEscapeHandler(handler)
  }, [open, setOpen])

  // isPositioned → 브라우저 페인트 후 애니메이션 시작 (Popover/DropdownMenu와 동일)
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
      {/* 외부 div: 포지셔닝(translate)만 담당 */}
      <div
        ref={refs.setFloating}
        data-woon-context-menu-floating=""
        style={{
          ...floatingStyles,
          zIndex,
          visibility: visible ? undefined : 'hidden',
        }}
      >
        {visible && (
          <FloatingFocusManager context={context} modal={false}>
            {/* 내부 div: 시각 스타일 + 진입 애니메이션 */}
            <div
              id={contentId}
              role="menu"
              data-woon-context-menu-content=""
              data-state="open"
              data-side={actualSide}
              style={{ transformOrigin: getTransformOrigin(actualSide, 'start'), ...style }}
              {...getFloatingProps(props)}
            >
              {/* FloatingList: Item이 elementsRef·labelsRef에 자동 등록 */}
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

// ─── ContextMenu.Item ─────────────────────────────────────────────────────────

type ContextMenuItemProps = {
  children: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
  asChild?: boolean
  /** typeahead용 텍스트. children이 문자열이면 자동 추출 */
  textValue?: string
  className?: string
  style?: CSSProperties
}

function ContextMenuItem({
  children,
  onSelect,
  disabled = false,
  asChild = false,
  textValue,
  ...props
}: ContextMenuItemProps) {
  const { activeIndex, setOpen, getItemProps } = useContextMenuContext()

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
    'data-woon-context-menu-item': '',
    'data-disabled': disabled ? ('' as const) : undefined,
    'data-highlighted': isActive ? ('' as const) : undefined,
    ...itemProps,
  }

  if (asChild) {
    return <Slot {...itemAttrs}>{children}</Slot>
  }

  return <div {...itemAttrs}>{children}</div>
}

// ─── ContextMenu.Separator ────────────────────────────────────────────────────

type ContextMenuSeparatorProps = {
  className?: string
}

function ContextMenuSeparator(props: ContextMenuSeparatorProps) {
  // biome-ignore lint/a11y/useSemanticElements: menu separator uses div for consistent box model with data attribute styling
  // biome-ignore lint/a11y/useFocusableInteractive: menu separators are intentionally non-focusable
  // biome-ignore lint/a11y/useAriaPropsForRole: aria-valuenow is for splitter role, not menu separator
  return <div role="separator" data-woon-context-menu-separator="" {...props} />
}

// ─── ContextMenu.Label ────────────────────────────────────────────────────────

type ContextMenuLabelProps = {
  children: React.ReactNode
  className?: string
}

function ContextMenuLabel({ children, ...props }: ContextMenuLabelProps) {
  return (
    <div data-woon-context-menu-label="" {...props}>
      {children}
    </div>
  )
}

// ─── ContextMenu.Group ────────────────────────────────────────────────────────

type ContextMenuGroupProps = {
  children: React.ReactNode
  className?: string
}

function ContextMenuGroup({ children, ...props }: ContextMenuGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: menu group uses div for consistent data attribute styling
    <div role="group" data-woon-context-menu-group="" {...props}>
      {children}
    </div>
  )
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Separator: ContextMenuSeparator,
  Label: ContextMenuLabel,
  Group: ContextMenuGroup,
}

export type { ContextMenuSide }
export { useContextMenuContext }
