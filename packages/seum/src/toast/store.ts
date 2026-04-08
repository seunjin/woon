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
    const openCount = state.visible.filter((t) => t.status === 'open').length

    if (openCount < maxVisible) {
      // 자리 있음: 맨 뒤(front)에 추가
      state = { ...state, visible: [...state.visible, full] }
    } else {
      // 꽉 참: oldest open을 closed로 마킹(fade-out 애니메이션), new를 visible 맨 뒤(front)에 추가
      const oldestOpenIdx = state.visible.findIndex((t) => t.status === 'open')
      const oldest = state.visible[oldestOpenIdx] as ToastInstance
      const newVisible = [
        ...state.visible.slice(0, oldestOpenIdx),
        { ...oldest, status: 'closed' as const }, // 즉시 제거 대신 fade-out 처리
        ...state.visible.slice(oldestOpenIdx + 1),
        full,
      ]
      const queued =
        state.queued.length >= maxQueue
          ? [...state.queued.slice(1), oldest]
          : [...state.queued, oldest]
      state = { visible: newVisible, queued }
    }

    notify()
  },

  close(id: string): void {
    const visible = state.visible.map((t) =>
      t.id === id ? { ...t, status: 'closed' as const } : t,
    )
    const openCountAfter = visible.filter((t) => t.status === 'open').length

    // 닫힌 후 자리가 생기면 즉시 큐 승격 → pulling과 동시에 뒤에서 올라옴
    if (openCountAfter < maxVisible && state.queued.length > 0) {
      const newestQueued = state.queued.at(-1)!
      const newQueued = state.queued.slice(0, -1)
      state = { visible: [{ ...newestQueued, status: 'open' }, ...visible], queued: newQueued }
    } else {
      state = { ...state, visible }
    }

    notify()
  },

  /** exit 애니메이션 종료 후 DOM에서만 제거 (큐 승격은 close()에서 처리) */
  remove(id: string): void {
    state = { ...state, visible: state.visible.filter((t) => t.id !== id) }
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
