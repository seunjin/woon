import { Portal, popEscapeHandler, pushEscapeHandler, waitForExit } from '@woon-ui/primitive'
import {
  createElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { DefaultToast } from './DefaultToast'
import type { ToastInstance, ToastRenderContext, ToastTone } from './store'
import { toastStore, useToastStore } from './store'

export type { ToastRenderContext, ToastTone } from './store'

import type { WoonPlugin } from '@woon-ui/primitive'

// ─── defaultRender 전역 등록 (setDefaultToastRender → Toaster에서 설정) ────────

let defaultToastRender: React.ComponentType<ToastDefaultRenderProps> | undefined

function setDefaultToastRender(
  render: React.ComponentType<ToastDefaultRenderProps> | undefined,
): void {
  defaultToastRender = render
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOAST_GAP = 8
const STACK_PEEK = 14
const DEFAULT_DURATION = 5000
const MIN_DURATION = 2000

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastContent = React.ReactNode | ((ctx: ToastRenderContext) => React.ReactNode)

/**
 * toastPlugin({ defaultRender })에 연결할 컴포넌트가 받는 props.
 * toast({ title, description, action }) 객체 문법 사용 시 이 타입으로 렌더됩니다.
 */
export type ToastDefaultRenderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  /**
   * 액션 버튼. 클릭 시 onClick 실행 후 토스트가 자동으로 닫힙니다.
   */
  action?: {
    label: React.ReactNode
    onClick: () => void
  }
  /** X 버튼 닫기. 라이브러리가 자동으로 주입합니다. */
  close: () => void
}

type ToastPropsContent = Omit<ToastDefaultRenderProps, 'close'>

function isToastPropsContent(content: unknown): content is ToastPropsContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    !isValidElement(content) &&
    'title' in content
  )
}

export type ToastOptions = {
  /** @default 'default' */
  tone?: ToastTone
  /**
   * 자동 닫힘 시간 (ms). `Infinity`로 설정하면 사용자가 직접 닫을 때까지 유지됩니다.
   * undo, 액션 버튼이 있는 토스트 등 인터랙션이 필요한 경우 사용하세요.
   * 최솟값 2000ms 미만은 2000ms로 보정됩니다.
   * @default 5000
   */
  duration?: number
}

export type ToastHandle = {
  id: string
  close: () => void
  update: (content: ToastContent | ToastPropsContent) => void
}

export type ToasterPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center'

export type ToasterProps = {
  /**
   * 화면에서 토스트가 표시되는 위치.
   * @default 'bottom-right'
   */
  position?: ToasterPosition
  /**
   * 동시에 화면에 표시할 수 있는 최대 토스트 수. 초과 시 가장 오래된 토스트가 사라집니다.
   * @default 3
   */
  maxVisible?: number
  /**
   * 토스트 컨테이너의 z-index.
   * @default 9000
   */
  zIndex?: number
  /**
   * toast({ title, description, action }) 객체 문법 사용 시 렌더할 컴포넌트.
   * 미설정 시 라이브러리 내장 컴포넌트를 사용합니다.
   *
   * @example
   * toastPlugin({ render: Toast })
   * // → toast({ title: '저장됨' })
   */
  render?: React.ComponentType<ToastDefaultRenderProps>
}

// ─── toast() ─────────────────────────────────────────────────────────────────

function toRenderFn(content: ToastContent): (ctx: ToastRenderContext) => React.ReactNode {
  return typeof content === 'function' ? content : () => content
}

function propsToRenderFn(props: ToastPropsContent): (ctx: ToastRenderContext) => React.ReactNode {
  return (ctx) => {
    if (!defaultToastRender) {
      console.warn('[woon] toast()에 object를 전달하려면 toastPlugin({ render })를 설정하세요.')
      return String(props.title)
    }
    // exactOptionalPropertyTypes: action이 없으면 키 자체를 포함하지 않음
    const actionProp = props.action
      ? {
          action: {
            label: props.action.label,
            // action 클릭 시 자동 close
            onClick: () => {
              props.action!.onClick()
              ctx.close()
            },
          },
        }
      : {}
    const descriptionProp =
      props.description !== undefined ? { description: props.description } : {}
    return createElement(defaultToastRender, {
      title: props.title,
      ...descriptionProp,
      ...actionProp,
      close: ctx.close,
    })
  }
}

export function toast(
  content: ToastContent | ToastPropsContent,
  options: ToastOptions = {},
): ToastHandle {
  const id = crypto.randomUUID()
  const { tone = 'default', duration: rawDuration = DEFAULT_DURATION } = options
  const duration = rawDuration === Infinity ? Infinity : Math.max(MIN_DURATION, rawDuration)

  const render = isToastPropsContent(content)
    ? propsToRenderFn(content)
    : toRenderFn(content as ToastContent)

  toastStore.push({ id, render, tone, duration })

  return {
    id,
    close: () => toastStore.close(id),
    update: (next) => {
      const renderFn = isToastPropsContent(next)
        ? propsToRenderFn(next)
        : toRenderFn(next as ToastContent)
      toastStore.update(id, renderFn)
    },
  }
}

// ─── ToastItemRenderer ────────────────────────────────────────────────────────

function ToastItemRenderer({
  item,
  stackIndex,
  isFront,
  expandedOffset,
  totalCount,
  isExpanded,
  onHeightChange,
}: {
  item: ToastInstance
  /** open 항목 기준 0 = 가장 최신 (front) */
  stackIndex: number
  isFront: boolean
  /** expanded 상태에서의 px offset. CSS --offset으로 전달 */
  expandedOffset: number
  totalCount: number
  /** 컨테이너 hover 여부 — 타이머 일시정지에 사용 */
  isExpanded: boolean
  onHeightChange: (id: string, height: number) => void
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // closed 전환 시 마지막 값 유지 — exit 애니메이션 도중 위치/방향 변화 방지
  const frozenStackIndexRef = useRef(stackIndex)
  const frozenFrontRef = useRef(isFront)
  if (item.status === 'open') {
    frozenStackIndexRef.current = stackIndex
    frozenFrontRef.current = isFront
  }

  const close = useCallback(() => toastStore.close(item.id), [item.id])

  // auto-dismiss 타이머 — hover(isExpanded) 또는 focus 시 일시정지, 재개 시 duration 전체 리셋
  const isPaused = isExpanded || isFocused
  useEffect(() => {
    if (item.status !== 'open') return
    if (item.duration === Infinity) return
    if (isPaused) return

    const timer = setTimeout(close, item.duration)
    return () => clearTimeout(timer)
  }, [item.status, item.duration, isPaused, close])

  // 높이 측정 + ResizeObserver (페인트 전)
  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    onHeightChange(item.id, el.offsetHeight)

    let obsRafId: number | undefined
    const observer = new ResizeObserver(() => {
      if (obsRafId !== undefined) cancelAnimationFrame(obsRafId)
      obsRafId = requestAnimationFrame(() => {
        if (wrapperRef.current) onHeightChange(item.id, wrapperRef.current.offsetHeight)
      })
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (obsRafId !== undefined) cancelAnimationFrame(obsRafId)
    }
  }, [item.id, onHeightChange])

  // 브라우저가 초기 상태(opacity:0, off-screen)를 먼저 페인트한 뒤 transition 시작
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (item.status !== 'closed') return
    const root = wrapperRef.current
    if (!root) {
      toastStore.remove(item.id)
      return
    }
    return waitForExit(root, () => toastStore.remove(item.id))
  }, [item.id, item.status])

  const ctx: ToastRenderContext = { close, tone: item.tone }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: focus 이벤트는 내부 버튼 등에서 버블링 — 래퍼 자체가 interactive한 게 아님
    <div
      ref={wrapperRef}
      data-woon-toast-wrapper
      data-state={item.status}
      data-mounted={mounted ? '' : undefined}
      data-front={frozenFrontRef.current ? '' : undefined}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={
        {
          '--toasts-before': frozenStackIndexRef.current,
          '--offset': `${expandedOffset}px`,
          zIndex: totalCount - frozenStackIndexRef.current,
        } as React.CSSProperties
      }
    >
      <div data-woon-toast data-tone={item.tone}>
        {item.render(ctx)}
      </div>
    </div>
  )
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

export function Toaster({
  position = 'bottom-right',
  maxVisible = 3,
  zIndex = 9000,
  render = DefaultToast,
}: ToasterProps) {
  toastStore.setConfig({ maxVisible })
  setDefaultToastRender(render)

  const { visible } = useToastStore()
  const [isExpanded, setIsExpanded] = useState(false)

  const [heights, setHeights] = useState<Record<string, number>>({})

  const handleHeightChange = useCallback((id: string, height: number) => {
    setHeights((prev) => {
      if (prev[id] === height) return prev
      return { ...prev, [id]: height }
    })
  }, [])

  // expanded offset: newest(stackIndex=0)이 offset=0(가장자리)에 오도록 reverse 순회
  const { expandedOffsets, expandedTotalHeight } = useMemo(() => {
    let offset = 0
    const expandedOffsets: Record<string, number> = {}

    for (const item of [...visible].reverse()) {
      expandedOffsets[item.id] = offset
      if (item.status === 'open') {
        offset += (heights[item.id] ?? 0) + TOAST_GAP
      }
    }

    return { expandedOffsets, expandedTotalHeight: Math.max(0, offset - TOAST_GAP) }
  }, [visible, heights])

  // collapsed 높이: 최신 open 토스트 + peek 여유분
  const collapsedHeight = useMemo(() => {
    const newestOpen = [...visible].reverse().find((t) => t.status === 'open')
    if (!newestOpen) return 0
    const openCount = visible.filter((t) => t.status === 'open').length
    return (heights[newestOpen.id] ?? 0) + STACK_PEEK * (openCount - 1)
  }, [visible, heights])

  const totalHeight = isExpanded ? expandedTotalHeight : collapsedHeight

  // ESC → front(최신 open) 토스트 닫기 — 개별 핸들러 대신 단일 핸들러로 순서 보장
  const visibleRef = useRef(visible)
  visibleRef.current = visible
  useEffect(() => {
    const hasOpen = visible.some((t) => t.status === 'open')
    if (!hasOpen) return
    const handler = () => {
      // visible 배열 마지막 open = front (stackIndex 0)
      const front = [...visibleRef.current].reverse().find((t) => t.status === 'open')
      if (front) toastStore.close(front.id)
    }
    pushEscapeHandler(handler)
    return () => popEscapeHandler(handler)
  }, [visible])

  // stackIndex: open 항목만으로 계산 — closed 항목 제외로 즉시 재계산됨
  const openStackIndices = useMemo(() => {
    const indices: Record<string, number> = {}
    const openItems = visible.filter((t) => t.status === 'open')
    for (let i = 0; i < openItems.length; i++) {
      const item = openItems[i]
      if (item) indices[item.id] = openItems.length - 1 - i
    }
    return indices
  }, [visible])

  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover expand/collapse는 보조 UX — keyboard는 ESC로 별도 처리 */}
      <section
        aria-live="polite"
        aria-atomic="false"
        data-woon-toaster
        data-position={position}
        data-expanded={isExpanded ? '' : undefined}
        style={{
          zIndex,
          height: totalHeight,
          transition: 'height 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: visible.length > 0 ? 'auto' : 'none',
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {visible.map((item) => (
          <ToastItemRenderer
            key={item.id}
            item={item}
            stackIndex={openStackIndices[item.id] ?? 0}
            isFront={openStackIndices[item.id] === 0}
            expandedOffset={expandedOffsets[item.id] ?? 0}
            totalCount={visible.length}
            isExpanded={isExpanded}
            onHeightChange={handleHeightChange}
          />
        ))}
      </section>
    </Portal>
  )
}

// ─── useToastState ────────────────────────────────────────────────────────────

export type ToastState = {
  /** 현재 화면에 표시 중인 토스트 목록 */
  visible: ToastInstance[]
}

export function useToastState(): ToastState {
  return useToastStore()
}

// ─── toastPlugin ──────────────────────────────────────────────────────────────

export type ToastPluginOptions = ToasterProps

export function toastPlugin(options: ToastPluginOptions = {}): WoonPlugin {
  return {
    id: 'woon/toast',
    render: () => <Toaster {...options} />,
  }
}
