import type { ConfirmRequest, ConfirmSnapshot, OverlayApi } from './types'

type ConfirmEntry = {
  id: number
  request: ConfirmRequest
  promise: Promise<boolean>
  resolve: (result: boolean) => void
  settled: boolean
}

export type OverlayController = {
  overlay: OverlayApi
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => ConfirmSnapshot
  confirmCurrent: () => void
  cancelCurrent: () => void
  requestClose: () => void
  completeClose: () => void
}

const IDLE_SNAPSHOT: ConfirmSnapshot = {
  open: false,
  request: null,
  status: 'idle',
  error: null,
}

export function createOverlayController(): OverlayController {
  let nextId = 1
  let current: ConfirmEntry | null = null
  let queue: ConfirmEntry[] = []
  let snapshot = IDLE_SNAPSHOT
  const listeners = new Set<() => void>()

  function publish(next: ConfirmSnapshot) {
    snapshot = next
    for (const listener of listeners) listener()
  }

  function findByDedupeKey(dedupeKey: string): ConfirmEntry | undefined {
    if (current?.request.dedupeKey === dedupeKey) return current
    return queue.find((entry) => entry.request.dedupeKey === dedupeKey)
  }

  function showNext() {
    current = queue.shift() ?? null
    if (!current) {
      publish(IDLE_SNAPSHOT)
      return
    }

    publish({
      open: true,
      request: current.request,
      status: 'open',
      error: null,
    })
  }

  function settleCurrent(result: boolean) {
    if (!current || current.settled) return

    current.settled = true
    current.resolve(result)
    publish({
      open: false,
      request: current.request,
      status: 'closing',
      error: null,
    })
  }

  function confirm(request: ConfirmRequest): Promise<boolean> {
    if (request.dedupeKey) {
      const duplicate = findByDedupeKey(request.dedupeKey)
      if (duplicate) return duplicate.promise
    }

    let resolve!: (result: boolean) => void
    const promise = new Promise<boolean>((nextResolve) => {
      resolve = nextResolve
    })
    const entry: ConfirmEntry = {
      id: nextId++,
      request,
      promise,
      resolve,
      settled: false,
    }

    queue.push(entry)
    if (!current) showNext()
    return promise
  }

  function confirmCurrent() {
    if (!current || current.settled) return
    if (snapshot.status !== 'open' && snapshot.status !== 'error') return

    const active = current
    const action = active.request.onConfirm
    if (!action) {
      settleCurrent(true)
      return
    }

    publish({
      open: true,
      request: active.request,
      status: 'pending',
      error: null,
    })

    void Promise.resolve()
      .then(action)
      .then(
        () => {
          if (current?.id !== active.id || active.settled) return
          settleCurrent(true)
        },
        (error: unknown) => {
          if (current?.id !== active.id || active.settled) return
          publish({
            open: true,
            request: active.request,
            status: 'error',
            error,
          })
        },
      )
  }

  function cancelCurrent() {
    if (!current || current.settled) return
    if (snapshot.status === 'pending' || snapshot.status === 'closing') return
    settleCurrent(false)
  }

  function requestClose() {
    if (current?.request.dismiss === 'block') return
    cancelCurrent()
  }

  function completeClose() {
    if (!current || snapshot.status !== 'closing') return
    current = null
    showNext()
  }

  function dismissAll() {
    const queued = queue
    queue = []
    for (const entry of queued) {
      if (!entry.settled) {
        entry.settled = true
        entry.resolve(false)
      }
    }

    cancelCurrent()
  }

  return {
    overlay: { confirm, dismissAll },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => snapshot,
    confirmCurrent,
    cancelCurrent,
    requestClose,
    completeClose,
  }
}
