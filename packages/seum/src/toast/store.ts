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
}

type Listener = () => void

let state: ToastStoreState = { visible: [] }
let maxVisible = 3
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
  setConfig(config: { maxVisible?: number }): void {
    if (config.maxVisible !== undefined) maxVisible = config.maxVisible
  },

  push(instance: Omit<ToastInstance, 'status'>): void {
    const full: ToastInstance = { ...instance, status: 'open' }
    const openCount = state.visible.filter((t) => t.status === 'open').length

    if (openCount < maxVisible) {
      state = { visible: [...state.visible, full] }
    } else {
      // 꽉 참: oldest open을 fade-out, 새 토스트를 front에 추가
      const oldestOpenIdx = state.visible.findIndex((t) => t.status === 'open')
      const oldest = state.visible[oldestOpenIdx] as ToastInstance
      state = {
        visible: [
          ...state.visible.slice(0, oldestOpenIdx),
          { ...oldest, status: 'closed' },
          ...state.visible.slice(oldestOpenIdx + 1),
          full,
        ],
      }
    }

    notify()
  },

  close(id: string): void {
    state = {
      visible: state.visible.map((t) => (t.id === id ? { ...t, status: 'closed' as const } : t)),
    }
    notify()
  },

  remove(id: string): void {
    state = { visible: state.visible.filter((t) => t.id !== id) }
    notify()
  },

  update(id: string, render: (ctx: ToastRenderContext) => React.ReactNode): void {
    state = {
      visible: state.visible.map((t) => (t.id === id ? { ...t, render } : t)),
    }
    notify()
  },

  closeAll(): void {
    state = {
      visible: state.visible.map((t) => ({ ...t, status: 'closed' as const })),
    }
    notify()
  },

  getSnapshot,
  subscribe,
}

export function useToastStore(): ToastStoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
