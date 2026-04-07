import { useCallback, useEffect, useRef } from 'react'
import type { SeumDialogContextValue } from './core/overlay-engine/dialog-context'
import { SeumDialogContext } from './core/overlay-engine/dialog-context'
import { popEscapeHandler, pushEscapeHandler } from './core/overlay-engine/escape-stack'
import { Portal } from './core/overlay-engine/portal'
import { lockScroll, unlockScroll } from './core/overlay-engine/scroll-lock'
import { overlayStore, setBaseZIndex, useOverlayStore } from './core/overlay-engine/store'
import type {
  DialogDataUpdater,
  DialogInstance,
  DialogOptions,
  DialogRenderContext,
  DialogResult,
} from './core/overlay-engine/types'
import { DEFAULT_DIALOG_OPTIONS } from './core/overlay-engine/types'
import type { SeumConfig } from './core/seum-config-context'
import { SeumConfigContext, setSeumDefaults } from './core/seum-config-context'

export type { SeumDialogContextValue } from './core/overlay-engine/dialog-context'
export type { DialogOptions, DialogResult } from './core/overlay-engine/types'
export type { SeumConfig, SeumDefaultComponents } from './core/seum-config-context'

export type DialogHandle<TData = undefined, TResult = void> = {
  id: string
  close: () => void
  resolve: (value: TResult) => void
  update: (next: DialogDataUpdater<TData>) => void
  result: Promise<DialogResult<TResult>>
}

export type DialogContext<TData = undefined, TResult = void> = {
  data: TData
  close: () => void
  resolve: (value: TResult) => void
  update: (next: DialogDataUpdater<TData>) => void
}

// ─── Animation helpers ────────────────────────────────────────────────────────

function parseTimeValue(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return 0
  if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed)
  if (trimmed.endsWith('s')) return Number.parseFloat(trimmed) * 1000
  return 0
}

function getLongestTime(durationList: string, delayList: string): number {
  const durations = durationList.split(',').map(parseTimeValue)
  const delays = delayList.split(',').map(parseTimeValue)
  const count = Math.max(durations.length, delays.length)

  let max = 0

  for (let index = 0; index < count; index += 1) {
    const duration = durations[index] ?? durations[durations.length - 1] ?? 0
    const delay = delays[index] ?? delays[delays.length - 1] ?? 0
    max = Math.max(max, duration + delay)
  }

  return max
}

function getExitDuration(root: HTMLElement): number {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]

  return elements.reduce((max, element) => {
    const style = window.getComputedStyle(element)
    const transitionTime = getLongestTime(style.transitionDuration, style.transitionDelay)
    const animationTime = getLongestTime(style.animationDuration, style.animationDelay)
    return Math.max(max, transitionTime, animationTime)
  }, 0)
}

function getRunningAnimations(root: HTMLElement): Animation[] {
  if (typeof root.getAnimations !== 'function') return []

  return root.getAnimations({ subtree: true }).filter((animation) => {
    const duration = animation.effect?.getTiming().duration
    return typeof duration === 'number' && duration > 0 && animation.playState !== 'finished'
  })
}

// ─── DialogRenderer ──────────────────────────────────────────────────────────

function DialogRenderer({ dialog }: { dialog: DialogInstance }) {
  const rootRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    overlayStore.settle(dialog.id, { status: 'dismissed' })
    overlayStore.pop(dialog.id)
  }, [dialog.id])

  const closeAll = useCallback(() => {
    overlayStore.popAll()
  }, [])

  const resolve = useCallback(
    (value: unknown) => {
      overlayStore.settle(dialog.id, { status: 'resolved', value })
      overlayStore.pop(dialog.id)
    },
    [dialog.id],
  )

  const update = useCallback(
    (next: DialogDataUpdater<unknown>) => {
      overlayStore.update(dialog.id, next)
    },
    [dialog.id],
  )

  useEffect(() => {
    if (dialog.options.scrollLock) lockScroll()

    const handleEscape = () => close()
    pushEscapeHandler(handleEscape)

    return () => {
      if (dialog.options.scrollLock) unlockScroll()
      popEscapeHandler(handleEscape)
    }
  }, [close, dialog.options.scrollLock])

  useEffect(() => {
    if (dialog.status !== 'closed') return

    const root = rootRef.current
    if (!root) {
      overlayStore.remove(dialog.id)
      return
    }

    let cancelled = false
    let timeoutId: number | undefined
    let rafId1: number | undefined
    let rafId2: number | undefined

    const finish = () => {
      if (cancelled) return
      cancelled = true
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      overlayStore.remove(dialog.id)
    }

    const waitForExit = () => {
      const animations = getRunningAnimations(root)
      if (animations.length > 0) {
        Promise.allSettled(animations.map((animation) => animation.finished)).finally(finish)

        const fallbackDuration = getExitDuration(root)
        if (fallbackDuration > 0) {
          timeoutId = window.setTimeout(finish, fallbackDuration + 50)
        }
        return
      }

      const exitDuration = getExitDuration(root)
      if (exitDuration > 0) {
        timeoutId = window.setTimeout(finish, exitDuration + 50)
        return
      }

      finish()
    }

    rafId1 = window.requestAnimationFrame(() => {
      rafId2 = window.requestAnimationFrame(waitForExit)
    })

    return () => {
      cancelled = true
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      if (rafId1 !== undefined) window.cancelAnimationFrame(rafId1)
      if (rafId2 !== undefined) window.cancelAnimationFrame(rafId2)
    }
  }, [dialog.id, dialog.status])

  const ctx: SeumDialogContextValue = {
    id: dialog.id,
    close,
    resolve,
    closeAll,
    options: dialog.options,
    explicitOptions: dialog.partialOptions ?? {},
    status: dialog.status,
    zIndex: dialog.zIndex,
  }

  const renderCtx: DialogRenderContext = { data: dialog.data, close, resolve, update }

  return (
    <div ref={rootRef} style={{ display: 'contents' }}>
      <SeumDialogContext value={ctx}>{dialog.render(renderCtx)}</SeumDialogContext>
    </div>
  )
}

// ─── SeumProvider ─────────────────────────────────────────────────────────────

interface SeumProviderProps {
  children: React.ReactNode
  config?: SeumConfig
}

export function SeumProvider({ children, config = {} }: SeumProviderProps) {
  const { dialogs } = useOverlayStore()
  const { defaults = {}, baseZIndex = 200 } = config

  setSeumDefaults(defaults)
  setBaseZIndex(baseZIndex)

  return (
    <SeumConfigContext value={config}>
      {children}
      <Portal>
        {dialogs.map((dialog) => (
          <DialogRenderer key={dialog.id} dialog={dialog} />
        ))}
      </Portal>
    </SeumConfigContext>
  )
}

// ─── useDialog ────────────────────────────────────────────────────────────────

type OpenDialogOptions<TData> = Partial<DialogOptions> & {
  initialData?: TData
}

export function useDialog() {
  const open = useCallback(
    <TData = undefined, TResult = void>(
      render: (ctx: DialogContext<TData, TResult>) => React.ReactNode,
      options?: OpenDialogOptions<TData>,
    ): DialogHandle<TData, TResult> => {
      const id = crypto.randomUUID()
      const { initialData, ...dialogOptions } = options ?? {}

      const close = () => {
        overlayStore.settle(id, { status: 'dismissed' })
        overlayStore.pop(id)
      }
      const resolve = (value: TResult) => {
        overlayStore.settle(id, { status: 'resolved', value } as DialogResult<unknown>)
        overlayStore.pop(id)
      }
      const update = (next: DialogDataUpdater<TData>) =>
        overlayStore.update(id, next as DialogDataUpdater<unknown>)

      const result = new Promise<DialogResult<TResult>>((settle) => {
        overlayStore.push({
          id,
          data: initialData,
          render: ({ data, close, resolve, update }) =>
            render({
              data: data as TData,
              close,
              resolve: resolve as (value: TResult) => void,
              update: update as (next: DialogDataUpdater<TData>) => void,
            }),
          options: { ...DEFAULT_DIALOG_OPTIONS, ...dialogOptions },
          partialOptions: dialogOptions,
          settle: settle as (result: DialogResult<unknown>) => void,
        })
      })

      return { id, close, resolve, update, result }
    },
    [],
  )

  const close = useCallback((id: string) => {
    overlayStore.settle(id, { status: 'dismissed' })
    overlayStore.pop(id)
  }, [])

  const closeAll = useCallback(() => {
    overlayStore.popAll()
  }, [])

  return { open, close, closeAll }
}
