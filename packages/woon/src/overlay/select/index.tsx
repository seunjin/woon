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
import { popEscapeHandler, pushEscapeHandler } from '../../core/overlay-engine/escape-stack'
import { Portal } from '../../core/overlay-engine/portal'
import { useFloatingZIndex } from '../../core/overlay-engine/store'
import { createSafeContext } from '../../core/shared/create-safe-context'
import { getTransformOrigin } from '../../core/shared/get-transform-origin'
import { Slot } from '../../core/shared/slot'

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectSide = 'top' | 'bottom'
type SelectAlign = 'start' | 'center' | 'end'

// ─── Context ──────────────────────────────────────────────────────────────────

type SelectContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  onItemSelect: (itemValue: string, itemLabel: React.ReactNode) => void
  registerLabel: (itemValue: string, itemLabel: React.ReactNode) => void
  getDisplayLabel: () => React.ReactNode
  activeIndex: number | null
  setActiveIndex: Dispatch<SetStateAction<number | null>>
  selectedIndex: number | null
  elementsRef: RefObject<(HTMLElement | null)[]>
  labelsRef: RefObject<(string | null)[]>
  valuesRef: RefObject<(string | null)[]>
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps']
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps']
  getItemProps: ReturnType<typeof useInteractions>['getItemProps']
  refs: ReturnType<typeof useFloating>['refs']
  floatingStyles: CSSProperties
  context: ReturnType<typeof useFloating>['context']
  isPositioned: boolean
  actualSide: SelectSide
  align: SelectAlign
  contentId: string
  disabled: boolean
}

const [SelectContext, useSelectContext] = createSafeContext<SelectContextValue>('Select')

// ─── Select.Root ──────────────────────────────────────────────────────────────

type SelectRootProps = {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  side?: SelectSide
  align?: SelectAlign
  sideOffset?: number
  alignOffset?: number
}

function SelectRoot({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  disabled = false,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
}: SelectRootProps) {
  const isControlled = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const value = isControlled ? controlledValue : uncontrolledValue

  const [open, setOpenRaw] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const elementsRef = useRef<(HTMLElement | null)[]>([])
  const labelsRef = useRef<(string | null)[]>([])
  const valuesRef = useRef<(string | null)[]>([])

  // value → ReactNode 레이블 맵. 아이템이 마운트될 때 등록됨.
  const optionLabelsRef = useRef<Map<string, React.ReactNode>>(new Map())
  // 레이블 맵 변경 시 트리거 리렌더를 위한 버전 카운터
  const [labelVersion, setLabelVersion] = useState(0)

  const contentId = useId()
  const placement = (align === 'center' ? side : `${side}-${align}`) as Placement

  // 현재 선택된 항목의 인덱스 (useListNavigation의 selectedIndex용)
  const selectedIndex =
    value !== ''
      ? valuesRef.current.indexOf(value) === -1
        ? null
        : valuesRef.current.indexOf(value)
      : null

  const setOpen = useCallback((next: boolean) => {
    setOpenRaw(next)
  }, [])

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
  const role = useRole(context, { role: 'listbox' })
  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    loop: true,
  })
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    selectedIndex,
    ...(open ? { onMatch: setActiveIndex } : {}),
  })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
    typeahead,
  ])

  const actualSide = (context.placement ?? placement).split('-')[0] as SelectSide

  // 아이템 선택 처리
  const onItemSelect = useCallback(
    (itemValue: string, itemLabel: React.ReactNode) => {
      if (!isControlled) setUncontrolledValue(itemValue)
      optionLabelsRef.current.set(itemValue, itemLabel)
      onValueChange?.(itemValue)
      setOpenRaw(false)
    },
    [isControlled, onValueChange],
  )

  // 아이템 마운트 시 레이블 등록
  const registerLabel = useCallback((itemValue: string, itemLabel: React.ReactNode) => {
    const prev = optionLabelsRef.current.get(itemValue)
    // 같은 값이면 업데이트 불필요 (문자열 비교만; ReactNode 깊은 비교는 불필요)
    if (prev !== itemLabel) {
      optionLabelsRef.current.set(itemValue, itemLabel)
      setLabelVersion((v) => v + 1)
    }
  }, [])

  const getDisplayLabel = useCallback((): React.ReactNode => {
    // labelVersion을 클로저에서 참조해 버전 변경 시 리렌더 유도
    void labelVersion
    return optionLabelsRef.current.get(value) ?? null
  }, [value, labelVersion])

  return (
    <SelectContext
      value={{
        open,
        setOpen,
        value,
        onItemSelect,
        registerLabel,
        getDisplayLabel,
        activeIndex,
        setActiveIndex,
        selectedIndex,
        elementsRef,
        labelsRef,
        valuesRef,
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
        disabled,
      }}
    >
      {children}
    </SelectContext>
  )
}

// ─── Select.Trigger ───────────────────────────────────────────────────────────

type SelectTriggerProps = {
  children?: React.ReactNode
  asChild?: boolean
  className?: string
  style?: CSSProperties
}

function SelectTrigger({ children, asChild = false, ...props }: SelectTriggerProps) {
  const { open, refs, getReferenceProps, contentId, disabled } = useSelectContext()

  const triggerProps = getReferenceProps({
    ref: refs.setReference,
    'aria-controls': open ? contentId : undefined,
    disabled,
  })

  const dataProps = {
    role: 'combobox' as const,
    'aria-expanded': open,
    'aria-haspopup': 'listbox' as const,
    'data-woon-select-trigger': '' as const,
    'data-state': open ? ('open' as const) : ('closed' as const),
    'data-disabled': disabled ? ('' as const) : undefined,
    ...props,
  }

  if (asChild) {
    return (
      <Slot {...triggerProps} {...dataProps}>
        {children}
      </Slot>
    )
  }

  return (
    <button type="button" {...triggerProps} {...dataProps}>
      {children}
    </button>
  )
}

// ─── Select.Value ─────────────────────────────────────────────────────────────

type SelectValueProps = {
  placeholder?: React.ReactNode
  className?: string
  style?: CSSProperties
}

function SelectValue({ placeholder, ...props }: SelectValueProps) {
  const { value, getDisplayLabel } = useSelectContext()
  const label = getDisplayLabel()

  const showPlaceholder = value === '' || label === null

  return (
    <span data-woon-select-value="" data-placeholder={showPlaceholder ? '' : undefined} {...props}>
      {showPlaceholder ? placeholder : label}
    </span>
  )
}

// ─── Select.Content ───────────────────────────────────────────────────────────

type SelectContentProps = {
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
}

function SelectContent({ children, style, ...props }: SelectContentProps) {
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
  } = useSelectContext()
  const zIndex = useFloatingZIndex(500)

  // ESC — overlay-engine escape-stack에 등록 (Dialog와 스택 공유)
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    pushEscapeHandler(handler)
    return () => popEscapeHandler(handler)
  }, [open, setOpen])

  // isPositioned → 브라우저 페인트 후 애니메이션 시작
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
        data-woon-select-floating=""
        style={{
          ...floatingStyles,
          zIndex,
          visibility: visible ? undefined : 'hidden',
        }}
      >
        {visible && (
          <FloatingFocusManager context={context} modal={false}>
            <div
              id={contentId}
              role="listbox"
              data-woon-select-content=""
              data-state="open"
              data-side={actualSide}
              data-align={align}
              style={{ transformOrigin: getTransformOrigin(actualSide, align), ...style }}
              {...getFloatingProps(props)}
            >
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

// ─── Select.Item ──────────────────────────────────────────────────────────────

type SelectItemProps = {
  children: React.ReactNode
  value: string
  disabled?: boolean
  asChild?: boolean
  textValue?: string
  className?: string
  style?: CSSProperties
}

function SelectItem({
  children,
  value: itemValue,
  disabled = false,
  asChild = false,
  textValue,
  ...props
}: SelectItemProps) {
  const {
    value: selectedValue,
    activeIndex,
    onItemSelect,
    registerLabel,
    getItemProps,
    valuesRef,
  } = useSelectContext()

  const isSelected = selectedValue === itemValue
  const label = disabled ? null : (textValue ?? (typeof children === 'string' ? children : null))

  const { ref, index } = useListItem({ label })

  // value 인덱스 등록
  useLayoutEffect(() => {
    valuesRef.current[index] = itemValue
    return () => {
      valuesRef.current[index] = null
    }
  }, [index, itemValue, valuesRef])

  // 레이블 등록 (트리거의 Select.Value 표시용)
  useLayoutEffect(() => {
    registerLabel(itemValue, children)
  }, [itemValue, children, registerLabel])

  const isActive = activeIndex === index

  const handleSelect = () => {
    if (disabled) return
    onItemSelect(itemValue, children)
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
    role: 'option' as const,
    'aria-selected': isSelected || undefined,
    'aria-disabled': disabled || undefined,
    'data-woon-select-item': '',
    'data-selected': isSelected ? ('' as const) : undefined,
    'data-disabled': disabled ? ('' as const) : undefined,
    'data-highlighted': isActive ? ('' as const) : undefined,
    ...itemProps,
  }

  if (asChild) {
    return <Slot {...itemAttrs}>{children}</Slot>
  }

  return <div {...itemAttrs}>{children}</div>
}

// ─── Select.Group ─────────────────────────────────────────────────────────────

type SelectGroupProps = {
  children: React.ReactNode
  className?: string
}

function SelectGroup({ children, ...props }: SelectGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: select group uses div for consistent data attribute styling
    <div role="group" data-woon-select-group="" {...props}>
      {children}
    </div>
  )
}

// ─── Select.Label ─────────────────────────────────────────────────────────────

type SelectLabelProps = {
  children: React.ReactNode
  className?: string
}

function SelectLabel({ children, ...props }: SelectLabelProps) {
  return (
    <div data-woon-select-label="" {...props}>
      {children}
    </div>
  )
}

// ─── Select.Separator ─────────────────────────────────────────────────────────

type SelectSeparatorProps = {
  className?: string
}

function SelectSeparator(props: SelectSeparatorProps) {
  // biome-ignore lint/a11y/useSemanticElements: select separator uses div for consistent box model with data attribute styling
  // biome-ignore lint/a11y/useFocusableInteractive: separators are intentionally non-focusable
  // biome-ignore lint/a11y/useAriaPropsForRole: aria-valuenow is for splitter role, not separator
  return <div role="separator" data-woon-select-separator="" {...props} />
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
}

export type { SelectAlign, SelectSide }
export { useSelectContext }
