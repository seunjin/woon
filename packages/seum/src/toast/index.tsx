import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { popEscapeHandler, pushEscapeHandler } from '../core/overlay-engine/escape-stack'
import { Portal } from '../core/overlay-engine/portal'
import { waitForExit } from '../core/shared/animation'
import type { ToastInstance, ToastRenderContext, ToastTone } from './store'
import { toastStore, useToastStore } from './store'

export type { ToastRenderContext, ToastTone } from './store'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOAST_GAP = 8
const STACK_PEEK = 14

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastContent = React.ReactNode | ((ctx: ToastRenderContext) => React.ReactNode)

export type ToastOptions = {
  /** @default 'default' */
  tone?: ToastTone
}

export type ToastHandle = {
  id: string
  close: () => void
  update: (content: ToastContent) => void
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
   * 동시에 화면에 표시할 수 있는 최대 토스트 수.
   * @default 5
   */
  maxVisible?: number
  /**
   * 대기 큐의 최대 크기.
   * @default 50
   */
  maxQueue?: number
  /**
   * 토스트 컨테이너의 z-index.
   * @default 9000
   */
  zIndex?: number
}

// ─── toast() ─────────────────────────────────────────────────────────────────

function toRenderFn(content: ToastContent): (ctx: ToastRenderContext) => React.ReactNode {
  return typeof content === 'function' ? content : () => content
}

export function toast(content: ToastContent, options: ToastOptions = {}): ToastHandle {
  const id = crypto.randomUUID()
  const { tone = 'default' } = options

  toastStore.push({ id, render: toRenderFn(content), tone })

  return {
    id,
    close: () => toastStore.close(id),
    update: (next) => toastStore.update(id, toRenderFn(next)),
  }
}

// ─── ToastItemRenderer ────────────────────────────────────────────────────────

function ToastItemRenderer({
  item,
  stackIndex,
  expandedOffset,
  totalCount,
  onHeightChange,
}: {
  item: ToastInstance
  /** 0 = 가장 최신 (front). CSS --index로 전달 */
  stackIndex: number
  /** expanded 상태에서의 px offset. CSS --offset으로 전달 */
  expandedOffset: number
  totalCount: number
  onHeightChange: (id: string, height: number) => void
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const close = useCallback(() => toastStore.close(item.id), [item.id])

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
    <div
      ref={wrapperRef}
      data-seum-toast-wrapper
      data-state={item.status}
      data-mounted={mounted ? '' : undefined}
      data-front={stackIndex === 0 ? '' : undefined}
      style={
        {
          // CSS가 --toasts-before, --offset, --lift(컨테이너 상속)를 이용해 transform 계산
          '--toasts-before': stackIndex,
          '--offset': `${expandedOffset}px`,
          zIndex: totalCount - stackIndex,
        } as React.CSSProperties
      }
    >
      <div data-seum-toast data-tone={item.tone}>
        {item.render(ctx)}
      </div>
    </div>
  )
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

export function Toaster({
  position = 'bottom-right',
  maxVisible = 5,
  maxQueue = 50,
  zIndex = 9000,
}: ToasterProps) {
  toastStore.setConfig({ maxVisible, maxQueue })

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

  // stackIndex: 배열에서 뒤에서의 위치 (newest = 0)
  const stackIndices = useMemo(() => {
    const indices: Record<string, number> = {}
    for (let i = 0; i < visible.length; i++) {
      const item = visible[i]
      if (item) indices[item.id] = visible.length - 1 - i
    }
    return indices
  }, [visible])

  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover expand/collapse는 보조 UX — keyboard는 ESC로 별도 처리 */}
      <section
        aria-live="polite"
        aria-atomic="false"
        data-seum-toaster
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
            stackIndex={stackIndices[item.id] ?? 0}
            expandedOffset={expandedOffsets[item.id] ?? 0}
            totalCount={visible.length}
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
  /** 표시 대기 중인 토스트 목록 */
  queued: ToastInstance[]
}

export function useToastState(): ToastState {
  return useToastStore()
}
