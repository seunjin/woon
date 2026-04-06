import { useCallback, useEffect, useRef } from 'react'
import { popEscapeHandler, pushEscapeHandler } from './core/overlay-engine/escape-stack'
import { Portal } from './core/overlay-engine/portal'
import { lockScroll, unlockScroll } from './core/overlay-engine/scroll-lock'
import { overlayStore, useOverlayStore } from './core/overlay-engine/store'
import type {
  DialogInstance,
  DialogOptions,
  DialogRenderContext,
  DialogStatus,
} from './core/overlay-engine/types'
import { DEFAULT_DIALOG_OPTIONS } from './core/overlay-engine/types'
import { createSafeContext } from './core/shared/create-safe-context'

// ─── SeumDialogContext ───────────────────────────────────────────────────────
// SeumProvider가 각 dialog 인스턴스에 주입하는 Context.
// Dialog.Close, Dialog.Overlay 등이 close를 자동으로 참조하기 위해 사용.

export type SeumDialogContextValue = {
  id: string
  close: () => void
  resolve: (value: unknown) => void
  options: DialogOptions
  status: DialogStatus
  zIndex: number
}

export const [SeumDialogContext, useSeumDialogContext] =
  createSafeContext<SeumDialogContextValue>('Dialog')

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
  const close = useCallback(() => overlayStore.pop(dialog.id), [dialog.id])

  const resolve = useCallback(
    (value: unknown) => {
      dialog.resolve?.(value)
      close()
    },
    [dialog.resolve, close],
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
    options: dialog.options,
    status: dialog.status,
    zIndex: dialog.zIndex,
  }

  const renderCtx: DialogRenderContext = { close, resolve }

  return (
    <div ref={rootRef} style={{ display: 'contents' }}>
      <SeumDialogContext value={ctx}>{dialog.render(renderCtx)}</SeumDialogContext>
    </div>
  )
}

// ─── SeumProvider ─────────────────────────────────────────────────────────────

interface SeumProviderProps {
  children: React.ReactNode
}

export function SeumProvider({ children }: SeumProviderProps) {
  const { dialogs } = useOverlayStore()

  return (
    <>
      {children}
      <Portal>
        {dialogs.map((dialog) => (
          <DialogRenderer key={dialog.id} dialog={dialog} />
        ))}
      </Portal>
    </>
  )
}

// ─── useDialog ────────────────────────────────────────────────────────────────

export function useDialog() {
  const open = useCallback(
    (
      render: (ctx: { close: () => void }) => React.ReactNode,
      options?: Partial<DialogOptions>,
    ): string => {
      const id = crypto.randomUUID()
      overlayStore.push({
        id,
        render: ({ close }) => render({ close }),
        options: { ...DEFAULT_DIALOG_OPTIONS, ...options },
      })
      return id
    },
    [],
  )

  const openAsync = useCallback(
    <T,>(
      render: (ctx: { resolve: (value: T) => void }) => React.ReactNode,
      options?: Partial<DialogOptions>,
    ): Promise<T> => {
      return new Promise<T>((promiseResolve) => {
        const id = crypto.randomUUID()
        overlayStore.push({
          id,
          render: ({ resolve }) => render({ resolve: resolve as (value: T) => void }),
          options: { ...DEFAULT_DIALOG_OPTIONS, ...options },
          resolve: promiseResolve as (value: unknown) => void,
        })
      })
    },
    [],
  )

  const close = useCallback((id: string) => {
    overlayStore.pop(id)
  }, [])

  return { open, openAsync, close }
}
