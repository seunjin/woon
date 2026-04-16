import {
  autoUpdate,
  FloatingList,
  flip,
  offset,
  type Placement,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useListItem,
  useListNavigation,
  useRole,
} from '@floating-ui/react'
import {
  createSafeContext,
  getTransformOrigin,
  Portal,
  popEscapeHandler,
  pushEscapeHandler,
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

type ComboboxSide = 'top' | 'bottom'
type ComboboxAlign = 'start' | 'center' | 'end'

// ─── Context ──────────────────────────────────────────────────────────────────

type ComboboxContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  inputValue: string
  handleInputChange: (newValue: string) => void
  handleBlur: () => void
  onItemSelect: (itemValue: string) => void
  registerLabel: (itemValue: string, label: string) => void
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
  actualSide: ComboboxSide
  align: ComboboxAlign
  contentId: string
  disabled: boolean
}

const [ComboboxContext, useComboboxContext] = createSafeContext<ComboboxContextValue>('Combobox')

// ─── Combobox.Root ────────────────────────────────────────────────────────────

type ComboboxRootProps = {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (value: string) => void
  disabled?: boolean
  freeForm?: boolean
  side?: ComboboxSide
  align?: ComboboxAlign
  sideOffset?: number
  alignOffset?: number
}

function ComboboxRoot({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  inputValue: controlledInputValue,
  defaultInputValue = '',
  onInputValueChange,
  disabled = false,
  freeForm = false,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
}: ComboboxRootProps) {
  const isValueControlled = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const value = isValueControlled ? controlledValue : uncontrolledValue

  const isInputControlled = controlledInputValue !== undefined
  const [uncontrolledInputValue, setUncontrolledInputValue] = useState(defaultInputValue)
  const inputValue = isInputControlled ? controlledInputValue : uncontrolledInputValue

  const [open, setOpenRaw] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const elementsRef = useRef<(HTMLElement | null)[]>([])
  const labelsRef = useRef<(string | null)[]>([])
  const valuesRef = useRef<(string | null)[]>([])

  // value → string 레이블 맵 (아이템 마운트 시 등록)
  const optionLabelsRef = useRef<Map<string, string>>(new Map())

  const contentId = useId()
  const placement = (align === 'center' ? side : `${side}-${align}`) as Placement

  const selectedIndex =
    value !== ''
      ? valuesRef.current.indexOf(value) === -1
        ? null
        : valuesRef.current.indexOf(value)
      : null

  const setOpen = useCallback((next: boolean) => setOpenRaw(next), [])

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

  const dismiss = useDismiss(context, { escapeKey: false })
  const role = useRole(context, { role: 'listbox' })
  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    loop: true,
    virtual: true,
    focusItemOnOpen: false,
  })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    dismiss,
    role,
    listNav,
  ])

  const actualSide = (context.placement ?? placement).split('-')[0] as ComboboxSide

  const registerLabel = useCallback((itemValue: string, label: string) => {
    optionLabelsRef.current.set(itemValue, label)
  }, [])

  const handleInputChange = useCallback(
    (newValue: string) => {
      if (!isInputControlled) setUncontrolledInputValue(newValue)
      onInputValueChange?.(newValue)
      setOpenRaw(true)
    },
    [isInputControlled, onInputValueChange],
  )

  const onItemSelect = useCallback(
    (itemValue: string) => {
      const label = optionLabelsRef.current.get(itemValue) ?? itemValue
      if (!isValueControlled) setUncontrolledValue(itemValue)
      if (!isInputControlled) setUncontrolledInputValue(label)
      onValueChange?.(itemValue)
      onInputValueChange?.(label)
      setOpenRaw(false)
      setActiveIndex(null)
    },
    [isValueControlled, isInputControlled, onValueChange, onInputValueChange],
  )

  const handleBlur = useCallback(() => {
    if (freeForm) {
      // 자유 입력 모드: 입력값 그대로 value로 설정
      if (inputValue !== value) {
        if (!isValueControlled) setUncontrolledValue(inputValue)
        onValueChange?.(inputValue)
      }
    } else {
      // 자동완성 모드: 입력을 지웠으면 선택값도 초기화, 아니면 레이블로 복원
      if (inputValue === '') {
        if (!isValueControlled) setUncontrolledValue('')
        if (value !== '') onValueChange?.('')
      } else {
        const label = value ? (optionLabelsRef.current.get(value) ?? '') : ''
        if (!isInputControlled) setUncontrolledInputValue(label)
        if (label !== inputValue) onInputValueChange?.(label)
      }
    }
    setOpenRaw(false)
    setActiveIndex(null)
  }, [
    freeForm,
    inputValue,
    value,
    isValueControlled,
    isInputControlled,
    onValueChange,
    onInputValueChange,
  ])

  return (
    <ComboboxContext
      value={{
        open,
        setOpen,
        value,
        inputValue,
        handleInputChange,
        handleBlur,
        onItemSelect,
        registerLabel,
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
    </ComboboxContext>
  )
}

// ─── Combobox.Input ───────────────────────────────────────────────────────────

type ComboboxInputProps = {
  placeholder?: string
  className?: string
  style?: CSSProperties
}

function ComboboxInput({ placeholder, ...props }: ComboboxInputProps) {
  const {
    open,
    setOpen,
    inputValue,
    handleInputChange,
    handleBlur,
    contentId,
    disabled,
    getReferenceProps,
    refs,
  } = useComboboxContext()

  return (
    <input
      ref={refs.setReference}
      type="text"
      value={inputValue}
      placeholder={placeholder}
      disabled={disabled}
      data-woon-combobox-input=""
      data-state={open ? 'open' : 'closed'}
      data-disabled={disabled ? '' : undefined}
      {...getReferenceProps({
        'aria-autocomplete': 'list' as const,
        'aria-controls': open ? contentId : undefined,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value),
        onFocus: () => setOpen(true),
        onBlur: handleBlur,
        ...props,
      })}
    />
  )
}

// ─── Combobox.Content ─────────────────────────────────────────────────────────

type ComboboxContentProps = {
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
}

function ComboboxContent({ children, style, ...props }: ComboboxContentProps) {
  const {
    open,
    setOpen,
    elementsRef,
    labelsRef,
    getFloatingProps,
    refs,
    floatingStyles,
    isPositioned,
    actualSide,
    align,
    contentId,
  } = useComboboxContext()
  const zIndex = useFloatingZIndex(500)

  // ESC — overlay-engine escape-stack에 등록
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
        data-woon-combobox-floating=""
        style={{
          ...floatingStyles,
          zIndex,
          visibility: visible ? undefined : 'hidden',
        }}
      >
        {visible && (
          <div
            id={contentId}
            role="listbox"
            data-woon-combobox-content=""
            data-state="open"
            data-side={actualSide}
            data-align={align}
            style={{ transformOrigin: getTransformOrigin(actualSide, align), ...style }}
            {...getFloatingProps({
              onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
              ...props,
            })}
          >
            <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
              {children}
            </FloatingList>
          </div>
        )}
      </div>
    </Portal>
  )
}

// ─── Combobox.Item ────────────────────────────────────────────────────────────

type ComboboxItemProps = {
  children: React.ReactNode
  value: string
  disabled?: boolean
  textValue?: string
  className?: string
  style?: CSSProperties
}

function ComboboxItem({
  children,
  value: itemValue,
  disabled = false,
  textValue,
  ...props
}: ComboboxItemProps) {
  const {
    value: selectedValue,
    activeIndex,
    onItemSelect,
    registerLabel,
    getItemProps,
    valuesRef,
    contentId,
  } = useComboboxContext()

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

  // 레이블 등록 (blur 시 복원용)
  useLayoutEffect(() => {
    if (label) registerLabel(itemValue, label)
  }, [itemValue, label, registerLabel])

  const isActive = activeIndex === index
  const itemId = `${contentId}-item-${index}`

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: tabIndex is provided via getItemProps spread
    <div
      role="option"
      id={itemId}
      aria-selected={isSelected || undefined}
      aria-disabled={disabled || undefined}
      data-woon-combobox-item=""
      data-selected={isSelected ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-highlighted={isActive ? '' : undefined}
      {...getItemProps({
        ref,
        tabIndex: -1,
        onClick: disabled ? undefined : () => onItemSelect(itemValue),
        ...props,
      })}
    >
      {children}
    </div>
  )
}

// ─── Combobox.Empty ───────────────────────────────────────────────────────────

type ComboboxEmptyProps = {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}

function ComboboxEmpty({ children, ...props }: ComboboxEmptyProps) {
  return (
    <div data-woon-combobox-empty="" {...props}>
      {children}
    </div>
  )
}

// ─── Combobox.Group ───────────────────────────────────────────────────────────

type ComboboxGroupProps = {
  children: React.ReactNode
  className?: string
}

function ComboboxGroup({ children, ...props }: ComboboxGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: combobox group uses div for consistent data attribute styling
    <div role="group" data-woon-combobox-group="" {...props}>
      {children}
    </div>
  )
}

// ─── Combobox.Label ───────────────────────────────────────────────────────────

type ComboboxLabelProps = {
  children: React.ReactNode
  className?: string
}

function ComboboxLabel({ children, ...props }: ComboboxLabelProps) {
  return (
    <div data-woon-combobox-label="" {...props}>
      {children}
    </div>
  )
}

// ─── Combobox.Separator ───────────────────────────────────────────────────────

type ComboboxSeparatorProps = {
  className?: string
}

function ComboboxSeparator(props: ComboboxSeparatorProps) {
  // biome-ignore lint/a11y/useSemanticElements: combobox separator uses div for consistent box model with data attribute styling
  // biome-ignore lint/a11y/useFocusableInteractive: separators are intentionally non-focusable
  // biome-ignore lint/a11y/useAriaPropsForRole: aria-valuenow is for splitter role, not separator
  return <div role="separator" data-woon-combobox-separator="" {...props} />
}

// ─── 공개 API ─────────────────────────────────────────────────────────────────

export const Combobox = {
  Root: ComboboxRoot,
  Input: ComboboxInput,
  Content: ComboboxContent,
  Item: ComboboxItem,
  Empty: ComboboxEmpty,
  Group: ComboboxGroup,
  Label: ComboboxLabel,
  Separator: ComboboxSeparator,
}

export type { ComboboxAlign, ComboboxSide }
export { useComboboxContext }
