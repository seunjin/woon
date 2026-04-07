import { useSyncExternalStore } from 'react'

export type ToastTone = 'default' | 'danger'
export type ToastStatus = 'open' | 'closed'

export type ToastRenderContext = {
  close: () => void
  tone: ToastTone
}

export type ToastInstance = {
  id: string
  render: (ctx: ToastRenderContext) => React.ReactNode
  tone: ToastTone
  status: ToastStatus
}

type ToastStoreState = {
  visible: ToastInstance[]
  queued: ToastInstance[]
}

type Listener = () => void

let state: ToastStoreState = { visible: [], queued: [] }
let maxVisible = 5
let maxQueue = 50
const listeners = new Set<Listener>()

function notify() {
  for (const l of listeners) l()
}

function getSnapshot(): ToastStoreState {
  return state
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const toastStore = {
  setConfig(config: { maxVisible?: number; maxQueue?: number }): void {
    if (config.maxVisible !== undefined) maxVisible = config.maxVisible
    if (config.maxQueue !== undefined) maxQueue = config.maxQueue
  },

  push(instance: Omit<ToastInstance, 'status'>): void {
    const full: ToastInstance = { ...instance, status: 'open' }

    if (state.visible.length < maxVisible) {
      state = { ...state, visible: [...state.visible, full] }
    } else {
      const queued =
        state.queued.length >= maxQueue
          ? [...state.queued.slice(1), full] // 큐가 꽉 차면 가장 오래된 대기 항목 제거
          : [...state.queued, full]
      state = { ...state, queued }
    }

    notify()
  },

  close(id: string): void {
    state = {
      ...state,
      visible: state.visible.map((t) => (t.id === id ? { ...t, status: 'closed' } : t)),
    }
    notify()
  },

  /** 애니메이션 종료 후 DOM에서 제거, 큐에서 다음 항목 승격 */
  remove(id: string): void {
    const [next, ...rest] = state.queued
    const visible = state.visible.filter((t) => t.id !== id)

    state = next
      ? { visible: [...visible, { ...next, status: 'open' }], queued: rest }
      : { ...state, visible }

    notify()
  },

  update(id: string, render: (ctx: ToastRenderContext) => React.ReactNode): void {
    state = {
      ...state,
      visible: state.visible.map((t) => (t.id === id ? { ...t, render } : t)),
    }
    notify()
  },

  closeAll(): void {
    state = {
      ...state,
      visible: state.visible.map((t) => ({ ...t, status: 'closed' })),
    }
    notify()
  },

  getSnapshot,
  subscribe,
}

export function useToastStore(): ToastStoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
