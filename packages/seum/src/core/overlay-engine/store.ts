import { useSyncExternalStore } from 'react'
import type { DialogInstance } from './types'

type StoreState = {
  dialogs: DialogInstance[]
}

const BASE_Z_INDEX = 200
const Z_INDEX_STEP = 10

function createOverlayStore() {
  let state: StoreState = { dialogs: [] }
  let nextZIndex = BASE_Z_INDEX

  const listeners = new Set<() => void>()

  function notify() {
    for (const listener of listeners) listener()
  }

  function getSnapshot(): StoreState {
    return state
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    getSnapshot,

    push(instance: Omit<DialogInstance, 'zIndex' | 'status'>): void {
      const zIndex = nextZIndex
      nextZIndex += Z_INDEX_STEP
      state = { dialogs: [...state.dialogs, { ...instance, zIndex, status: 'open' }] }
      notify()
    },

    pop(id: string): void {
      let changed = false
      state = {
        dialogs: state.dialogs.map((dialog) => {
          if (dialog.id !== id || dialog.status === 'closed') return dialog
          changed = true
          return { ...dialog, status: 'closed' }
        }),
      }
      if (changed) notify()
    },

    remove(id: string): void {
      state = { dialogs: state.dialogs.filter((d) => d.id !== id) }
      if (state.dialogs.length === 0) nextZIndex = BASE_Z_INDEX
      notify()
    },

    getTopDialog(): DialogInstance | undefined {
      return state.dialogs.at(-1)
    },
  }
}

export const overlayStore = createOverlayStore()

export function useOverlayStore(): StoreState {
  return useSyncExternalStore(
    overlayStore.subscribe,
    overlayStore.getSnapshot,
    overlayStore.getSnapshot,
  )
}
