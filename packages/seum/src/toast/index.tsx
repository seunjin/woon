import { useCallback, useEffect, useRef } from 'react'
import { popEscapeHandler, pushEscapeHandler } from '../core/overlay-engine/escape-stack'
import { Portal } from '../core/overlay-engine/portal'
import { waitForExit } from '../core/shared/animation'
import type { ToastInstance, ToastRenderContext, ToastTone } from './store'
import { toastStore, useToastStore } from './store'

export type { ToastRenderContext, ToastTone } from './store'

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
   * 초과분은 큐에 대기하다가 앞의 토스트가 닫히면 순서대로 표시됩니다.
   * @default 5
   */
  maxVisible?: number
  /**
   * 대기 큐의 최대 크기. 초과 시 가장 오래된 대기 항목부터 제거됩니다.
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

function ToastItemRenderer({ item }: { item: ToastInstance }) {
  const rootRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    toastStore.close(item.id)
  }, [item.id])

  useEffect(() => {
    pushEscapeHandler(close)
    return () => popEscapeHandler(close)
  }, [close])

  useEffect(() => {
    if (item.status !== 'closed') return

    const root = rootRef.current
    if (!root) {
      toastStore.remove(item.id)
      return
    }

    return waitForExit(root, () => toastStore.remove(item.id))
  }, [item.id, item.status])

  const ctx: ToastRenderContext = { close, tone: item.tone }

  return (
    <div ref={rootRef} data-seum-toast data-state={item.status} data-tone={item.tone}>
      {item.render(ctx)}
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

  return (
    <Portal>
      <div
        aria-live="polite"
        aria-atomic="false"
        data-seum-toaster
        data-position={position}
        style={{ zIndex }}
      >
        {visible.map((item) => (
          <ToastItemRenderer key={item.id} item={item} />
        ))}
      </div>
    </Portal>
  )
}

// ─── useToastState ────────────────────────────────────────────────────────────

export type ToastState = {
  /** 현재 화면에 표시 중인 토스트 목록 */
  visible: ToastInstance[]
  /** 표시 대기 중인 토스트 목록 */
  queued: ToastInstance[]
  /** 대기 중인 토스트 수 — "N개 더 있음" UI 구현에 활용 */
  queuedCount: number
}

export function useToastState(): ToastState {
  const { visible, queued } = useToastStore()
  return { visible, queued, queuedCount: queued.length }
}
