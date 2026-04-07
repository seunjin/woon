import { useSyncExternalStore } from 'react'
import type { DialogDataUpdater, DialogInstance, DialogResult } from './types'

type StoreState = {
  dialogs: DialogInstance[]
}

let _baseZIndex = 200
const Z_INDEX_STEP = 1

export function setBaseZIndex(n: number): void {
  _baseZIndex = n
}

function createOverlayStore() {
  let state: StoreState = { dialogs: [] }
  let nextZIndex: number | undefined

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

    push(instance: Omit<DialogInstance, 'zIndex' | 'status' | 'settled'>): void {
      const zIndex = nextZIndex ?? _baseZIndex
      nextZIndex = zIndex + Z_INDEX_STEP
      state = {
        dialogs: [...state.dialogs, { ...instance, zIndex, status: 'open', settled: false }],
      }
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

    update(id: string, next: DialogDataUpdater<unknown>): void {
      let changed = false

      state = {
        dialogs: state.dialogs.map((dialog) => {
          if (dialog.id !== id) return dialog

          const value =
            typeof next === 'function' ? (next as (prev: unknown) => unknown)(dialog.data) : next

          if (Object.is(dialog.data, value)) return dialog

          changed = true
          return { ...dialog, data: value }
        }),
      }

      if (changed) notify()
    },

    settle(id: string, result: DialogResult<unknown>): void {
      let settleDialog: DialogInstance | undefined

      state = {
        dialogs: state.dialogs.map((dialog) => {
          if (dialog.id !== id || dialog.settled) return dialog
          settleDialog = dialog
          return { ...dialog, settled: true }
        }),
      }

      if (!settleDialog) return

      settleDialog.settle?.(result)
      notify()
    },

    popAll(): void {
      const updated: DialogInstance[] = []
      const toSettle: DialogInstance[] = []

      for (const dialog of state.dialogs) {
        if (dialog.status === 'open') {
          updated.push({ ...dialog, status: 'closed' })
          if (!dialog.settled) toSettle.push(dialog)
        } else {
          updated.push(dialog)
        }
      }

      state = { dialogs: updated }

      for (const dialog of toSettle) {
        dialog.settle?.({ status: 'dismissed', value: undefined })
      }

      notify()
    },

    remove(id: string): void {
      state = { dialogs: state.dialogs.filter((d) => d.id !== id) }
      if (state.dialogs.length === 0) nextZIndex = undefined
      notify()
    },

    getTopDialog(): DialogInstance | undefined {
      return state.dialogs.at(-1)
    },

    getDialog(id: string): DialogInstance | undefined {
      return state.dialogs.find((dialog) => dialog.id === id)
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
