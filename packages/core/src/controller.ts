import type {
  AlertRequest,
  AlertSnapshot,
  ConfirmRequest,
  ConfirmSnapshot,
  OverlayApi,
} from './types'

type EntryBase = {
  id: number
  settled: boolean
}

type AlertEntry = EntryBase & {
  kind: 'alert'
  request: AlertRequest
  promise: Promise<void>
  resolve: () => void
}

type ConfirmEntry = EntryBase & {
  kind: 'confirm'
  request: ConfirmRequest
  promise: Promise<boolean>
  resolve: (result: boolean) => void
}

type OverlayEntry = AlertEntry | ConfirmEntry

type IdleControllerSnapshot = {
  kind: null
  open: false
  request: null
  status: 'idle'
  error: null
}

type AlertControllerSnapshot = AlertSnapshot & {
  kind: 'alert'
  request: AlertRequest
  error: null
}

type ConfirmControllerSnapshot = ConfirmSnapshot & {
  kind: 'confirm'
  request: ConfirmRequest
}

export type OverlayControllerSnapshot =
  | IdleControllerSnapshot
  | AlertControllerSnapshot
  | ConfirmControllerSnapshot

export type OverlayController = {
  overlay: OverlayApi
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => OverlayControllerSnapshot
  acknowledgeCurrent: () => void
  confirmCurrent: () => void
  cancelCurrent: () => void
  requestClose: () => void
  completeClose: () => void
}

const IDLE_SNAPSHOT: IdleControllerSnapshot = {
  kind: null,
  open: false,
  request: null,
  status: 'idle',
  error: null,
}

export function createOverlayController(): OverlayController {
  let nextId = 1
  let current: OverlayEntry | null = null
  let queue: OverlayEntry[] = []
  let snapshot: OverlayControllerSnapshot = IDLE_SNAPSHOT
  const listeners = new Set<() => void>()

  function publish(next: OverlayControllerSnapshot) {
    snapshot = next
    for (const listener of listeners) listener()
  }

  function findByDedupeKey<Kind extends OverlayEntry['kind']>(
    kind: Kind,
    dedupeKey: string,
  ): Extract<OverlayEntry, { kind: Kind }> | undefined {
    const entries = current ? [current, ...queue] : queue
    return entries.find(
      (entry): entry is Extract<OverlayEntry, { kind: Kind }> =>
        entry.kind === kind && entry.request.dedupeKey === dedupeKey,
    )
  }

  function publishEntry(entry: OverlayEntry, open: boolean, status: 'open' | 'closing') {
    if (entry.kind === 'alert') {
      publish({ kind: 'alert', open, request: entry.request, status, error: null })
      return
    }
    publish({ kind: 'confirm', open, request: entry.request, status, error: null })
  }

  function showNext() {
    current = queue.shift() ?? null
    if (!current) {
      publish(IDLE_SNAPSHOT)
      return
    }
    publishEntry(current, true, 'open')
  }

  function settleAlert(entry: AlertEntry) {
    if (entry.settled || current?.id !== entry.id) return
    entry.settled = true
    entry.resolve()
    publishEntry(entry, false, 'closing')
  }

  function settleConfirm(entry: ConfirmEntry, result: boolean) {
    if (entry.settled || current?.id !== entry.id) return
    entry.settled = true
    entry.resolve(result)
    publishEntry(entry, false, 'closing')
  }

  function alert(request: AlertRequest): Promise<void> {
    if (request.dedupeKey) {
      const duplicate = findByDedupeKey('alert', request.dedupeKey)
      if (duplicate) return duplicate.promise
    }

    let resolve!: () => void
    const promise = new Promise<void>((nextResolve) => {
      resolve = nextResolve
    })
    const entry: AlertEntry = {
      kind: 'alert',
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

  function confirm(request: ConfirmRequest): Promise<boolean> {
    if (request.dedupeKey) {
      const duplicate = findByDedupeKey('confirm', request.dedupeKey)
      if (duplicate) return duplicate.promise
    }

    let resolve!: (result: boolean) => void
    const promise = new Promise<boolean>((nextResolve) => {
      resolve = nextResolve
    })
    const entry: ConfirmEntry = {
      kind: 'confirm',
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

  function acknowledgeCurrent() {
    if (current?.kind !== 'alert' || snapshot.status !== 'open') return
    settleAlert(current)
  }

  function confirmCurrent() {
    if (current?.kind !== 'confirm' || current.settled) return
    if (snapshot.status !== 'open' && snapshot.status !== 'error') return

    const active = current
    const action = active.request.onConfirm
    if (!action) {
      settleConfirm(active, true)
      return
    }

    publish({
      kind: 'confirm',
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
          settleConfirm(active, true)
        },
        (error: unknown) => {
          if (current?.id !== active.id || active.settled) return
          publish({
            kind: 'confirm',
            open: true,
            request: active.request,
            status: 'error',
            error,
          })
        },
      )
  }

  function cancelCurrent() {
    if (current?.kind !== 'confirm' || current.settled) return
    if (snapshot.status === 'pending' || snapshot.status === 'closing') return
    settleConfirm(current, false)
  }

  function requestClose() {
    if (!current) return
    if (current.kind === 'alert') {
      acknowledgeCurrent()
      return
    }
    if (current.request.dismiss === 'block') return
    cancelCurrent()
  }

  function completeClose() {
    if (!current || snapshot.status !== 'closing') return
    current = null
    showNext()
  }

  function dismissQueuedEntry(entry: OverlayEntry) {
    if (entry.settled) return
    entry.settled = true
    if (entry.kind === 'alert') entry.resolve()
    else entry.resolve(false)
  }

  function dismissAll() {
    const queued = queue
    queue = []
    for (const entry of queued) dismissQueuedEntry(entry)

    if (current?.kind === 'alert') acknowledgeCurrent()
    else cancelCurrent()
  }

  return {
    overlay: { alert, confirm, dismissAll },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => snapshot,
    acknowledgeCurrent,
    confirmCurrent,
    cancelCurrent,
    requestClose,
    completeClose,
  }
}
