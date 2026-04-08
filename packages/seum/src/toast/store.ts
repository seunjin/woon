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
      // 꽉 참: oldest open을 visible에서 꺼내 queue로, new를 visible 맨 뒤(front)에 추가
      // → 항상 최신 maxVisible개가 visible에 유지됨
      const oldestOpenIdx = state.visible.findIndex((t) => t.status === 'open')
      // openCount >= maxVisible > 0 이므로 반드시 존재
      const oldest = state.visible[oldestOpenIdx] as ToastInstance
      const newVisible = [
        ...state.visible.slice(0, oldestOpenIdx),
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

    // queue에서 가장 최신(맨 뒤) 항목을 꺼내 visible 맨 앞(oldest/back 슬롯)에 삽입
    // → 기존 front 토스트는 유지되고, 새 항목이 back에서 슬라이드인
    const newestQueued = state.queued.at(-1)
    const newQueued = state.queued.slice(0, -1)

    state = newestQueued
      ? { visible: [{ ...newestQueued, status: 'open' }, ...visible], queued: newQueued }
      : { ...state, visible }

    notify()
  },

  /** 애니메이션 종료 후 DOM에서만 제거 (큐 승격은 close()에서 이미 처리) */
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
