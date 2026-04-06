import { useCallback, useEffect, useRef } from 'react'
import type {
  DialogFlowStep,
  DialogMessageStep,
  DialogPresetTone,
  SeumDialogContextValue,
} from './core/overlay-engine/dialog-context'
import { SeumDialogContext } from './core/overlay-engine/dialog-context'
import { popEscapeHandler, pushEscapeHandler } from './core/overlay-engine/escape-stack'
import { Portal } from './core/overlay-engine/portal'
import { lockScroll, unlockScroll } from './core/overlay-engine/scroll-lock'
import { overlayStore, useOverlayStore } from './core/overlay-engine/store'
import type {
  DialogDataUpdater,
  DialogInstance,
  DialogOptions,
  DialogRenderContext,
  DialogResult,
} from './core/overlay-engine/types'
import { DEFAULT_DIALOG_OPTIONS } from './core/overlay-engine/types'
import { Dialog, DialogDescription, DialogOverlay, DialogTitle } from './overlay/dialog/primitives'

export type {
  DialogFlowStep,
  DialogMessageStep,
  DialogPresetTone,
  SeumDialogContextValue,
} from './core/overlay-engine/dialog-context'
export type { DialogResult } from './core/overlay-engine/types'

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

type DialogFlowState<TData> = {
  step: DialogFlowStep
  data: TData
}

export type DialogFlowHandle<TData = undefined, TResult = void> = {
  id: string
  close: () => void
  resolve: (value: TResult) => void
  transition: (step: DialogFlowStep, data?: DialogDataUpdater<TData>) => void
  result: Promise<DialogResult<TResult>>
}

export type DialogFlowContext<TData = undefined, TResult = void> = {
  step: DialogFlowStep
  data: TData
  close: () => void
  resolve: (value: TResult) => void
  transition: (step: DialogFlowStep, data?: DialogDataUpdater<TData>) => void
}

type OpenDialogOptions<TData> = Partial<DialogOptions> & {
  initialData?: TData
}

type FlowDialogOptions<TData> = Partial<DialogOptions> & {
  initialStep?: DialogFlowStep
  initialData?: TData
}

export type DialogAlertResult = { status: 'acknowledged' } | { status: 'dismissed' }

export type DialogAlertOptions = Partial<DialogOptions> & {
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  tone?: DialogPresetTone
  overlayProps?: React.HTMLAttributes<HTMLDivElement>
  contentProps?: React.HTMLAttributes<HTMLDivElement>
  confirmButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export type DialogConfirmResult =
  | { status: 'confirmed' }
  | { status: 'cancelled' }
  | { status: 'dismissed' }

export type DialogConfirmErrorConfig =
  | DialogMessageStep
  | ((error: unknown) => DialogMessageStep)
  | false

export type DialogConfirmOptions = Partial<DialogOptions> & {
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  tone?: DialogPresetTone
  onConfirm?: () => void | Promise<void>
  loading?: Omit<DialogMessageStep, 'cancelLabel'> | false
  success?: Omit<DialogMessageStep, 'cancelLabel'> | false
  error?: DialogConfirmErrorConfig
  overlayProps?: React.HTMLAttributes<HTMLDivElement>
  contentProps?: React.HTMLAttributes<HTMLDivElement>
  confirmButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  cancelButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

type DialogConfirmData = {
  error: unknown
}

function getConfirmStepCopy(
  step: DialogFlowStep,
  options: DialogConfirmOptions,
  error: unknown,
): DialogMessageStep {
  if (step === 'confirm') {
    return {
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? '확인',
      cancelLabel: options.cancelLabel ?? '취소',
    }
  }

  if (step === 'loading') {
    const copy = options.loading === false ? {} : (options.loading ?? {})
    return {
      title: copy.title ?? '처리 중입니다',
      description: copy.description ?? options.description ?? '잠시만 기다려주세요.',
      confirmLabel: copy.confirmLabel ?? '처리 중',
    }
  }

  if (step === 'success') {
    const copy = options.success === false ? {} : (options.success ?? {})
    return {
      title: copy.title ?? '완료되었습니다',
      description: copy.description ?? options.description,
      confirmLabel: copy.confirmLabel ?? '확인',
    }
  }

  const copy =
    typeof options.error === 'function'
      ? options.error(error)
      : options.error === false
        ? {}
        : (options.error ?? {})

  return {
    title: copy.title ?? '처리하지 못했습니다',
    description: copy.description ?? '다시 시도해주세요.',
    confirmLabel: copy.confirmLabel ?? options.confirmLabel ?? '다시 시도',
    cancelLabel: copy.cancelLabel ?? '닫기',
  }
}

function DialogPresetShell({
  title,
  description,
  children,
  overlayProps,
  contentProps,
  tone = 'default',
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  overlayProps?: React.HTMLAttributes<HTMLDivElement> | undefined
  contentProps?: React.HTMLAttributes<HTMLDivElement> | undefined
  tone?: DialogPresetTone
}) {
  return (
    <DialogOverlay {...(overlayProps ?? {})}>
      <Dialog.Content data-seum-dialog-preset data-tone={tone} {...(contentProps ?? {})}>
        {title !== undefined && <DialogTitle>{title}</DialogTitle>}
        {description !== undefined && <DialogDescription>{description}</DialogDescription>}
        {children}
      </Dialog.Content>
    </DialogOverlay>
  )
}

function dismissDialog(id: string) {
  overlayStore.settle(id, { status: 'dismissed' })
  overlayStore.pop(id)
}

function resolveDialog<TResult>(id: string, value: TResult) {
  overlayStore.settle(id, { status: 'resolved', value } as DialogResult<unknown>)
  overlayStore.pop(id)
}

function updateDialogData<TData>(id: string, next: DialogDataUpdater<TData>) {
  overlayStore.update(id, next as DialogDataUpdater<unknown>)
}

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
  const close = useCallback(() => dismissDialog(dialog.id), [dialog.id])

  const resolve = useCallback(
    (value: unknown) => {
      resolveDialog(dialog.id, value)
    },
    [dialog.id],
  )

  const update = useCallback(
    (next: DialogDataUpdater<unknown>) => {
      updateDialogData(dialog.id, next)
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
    options: dialog.options,
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
    <TData = undefined, TResult = void>(
      render: (ctx: DialogContext<TData, TResult>) => React.ReactNode,
      options?: OpenDialogOptions<TData>,
    ): DialogHandle<TData, TResult> => {
      const id = crypto.randomUUID()
      const { initialData, ...dialogOptions } = options ?? {}

      const close = () => dismissDialog(id)
      const resolve = (value: TResult) => resolveDialog(id, value)
      const update = (next: DialogDataUpdater<TData>) => updateDialogData(id, next)

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
          settle: settle as (result: DialogResult<unknown>) => void,
        })
      })

      return { id, close, resolve, update, result }
    },
    [],
  )

  const flow = useCallback(
    <TData = undefined, TResult = void>(
      render: (ctx: DialogFlowContext<TData, TResult>) => React.ReactNode,
      options?: FlowDialogOptions<TData>,
    ): DialogFlowHandle<TData, TResult> => {
      const { initialStep = 'confirm', initialData, ...dialogOptions } = options ?? {}

      const handle = open<DialogFlowState<TData>, TResult>(
        ({ data, close, resolve, update }) => {
          const transition = (step: DialogFlowStep, nextData?: DialogDataUpdater<TData>) => {
            update((prev) => ({
              step,
              data:
                nextData === undefined
                  ? prev.data
                  : typeof nextData === 'function'
                    ? (nextData as (current: TData) => TData)(prev.data)
                    : nextData,
            }))
          }

          return render({
            step: data.step,
            data: data.data,
            close,
            resolve,
            transition,
          })
        },
        {
          ...dialogOptions,
          initialData: {
            step: initialStep,
            data: initialData as TData,
          },
        },
      )

      return {
        id: handle.id,
        close: handle.close,
        resolve: handle.resolve,
        result: handle.result,
        transition: (step: DialogFlowStep, nextData?: DialogDataUpdater<TData>) => {
          handle.update((prev) => ({
            step,
            data:
              nextData === undefined
                ? prev.data
                : typeof nextData === 'function'
                  ? (nextData as (current: TData) => TData)(prev.data)
                  : nextData,
          }))
        },
      }
    },
    [open],
  )

  const alert = useCallback(
    async (options: DialogAlertOptions): Promise<DialogAlertResult> => {
      const {
        title,
        description,
        confirmLabel = '확인',
        tone = 'default',
        overlayProps,
        contentProps,
        confirmButtonProps,
        ...dialogOptions
      } = options

      const handle = open<undefined, DialogAlertResult>(
        ({ resolve }) => (
          <DialogPresetShell
            title={title}
            description={description}
            tone={tone}
            overlayProps={overlayProps}
            contentProps={contentProps}
          >
            <div data-seum-alert-actions="">
              <button
                type="button"
                data-seum-alert-confirm=""
                data-tone={tone}
                {...confirmButtonProps}
                onClick={(event) => {
                  confirmButtonProps?.onClick?.(event)
                  resolve({ status: 'acknowledged' })
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </DialogPresetShell>
        ),
        dialogOptions,
      )

      const result = await handle.result
      return result.status === 'dismissed' ? { status: 'dismissed' } : result.value
    },
    [open],
  )

  const confirm = useCallback(
    async (options: DialogConfirmOptions): Promise<DialogConfirmResult> => {
      const {
        tone = 'default',
        overlayProps,
        contentProps,
        confirmButtonProps,
        cancelButtonProps,
        onConfirm,
        ...dialogOptions
      } = options

      const flowHandle = flow<DialogConfirmData, DialogConfirmResult>(
        ({ step, data, close, resolve, transition }) => {
          const copy = getConfirmStepCopy(step, options, data.error)

          return (
            <DialogPresetShell
              title={copy.title}
              description={copy.description}
              tone={tone}
              overlayProps={overlayProps}
              contentProps={contentProps}
            >
              <div data-seum-confirm-actions="" data-step={step}>
                {step === 'confirm' && (
                  <>
                    <button
                      type="button"
                      data-seum-confirm-cancel=""
                      {...cancelButtonProps}
                      onClick={(event) => {
                        cancelButtonProps?.onClick?.(event)
                        resolve({ status: 'cancelled' })
                      }}
                    >
                      {copy.cancelLabel}
                    </button>
                    <button
                      type="button"
                      data-seum-confirm-confirm=""
                      data-tone={tone}
                      {...confirmButtonProps}
                      onClick={async (event) => {
                        confirmButtonProps?.onClick?.(event)

                        if (!onConfirm) {
                          resolve({ status: 'confirmed' })
                          return
                        }

                        transition('loading')

                        try {
                          await onConfirm()

                          if (options.success === false || options.success === undefined) {
                            resolve({ status: 'confirmed' })
                            return
                          }

                          transition('success')
                        } catch (error) {
                          if (options.error === false) {
                            transition('confirm', { error })
                            return
                          }

                          transition('error', { error })
                        }
                      }}
                    >
                      {copy.confirmLabel}
                    </button>
                  </>
                )}
                {step === 'loading' && (
                  <button type="button" data-seum-confirm-confirm="" data-tone={tone} disabled>
                    {copy.confirmLabel}
                  </button>
                )}
                {step === 'success' && (
                  <button
                    type="button"
                    data-seum-confirm-confirm=""
                    data-tone={tone}
                    onClick={() => resolve({ status: 'confirmed' })}
                  >
                    {copy.confirmLabel}
                  </button>
                )}
                {step === 'error' && (
                  <>
                    <button
                      type="button"
                      data-seum-confirm-cancel=""
                      onClick={() => resolve({ status: 'cancelled' })}
                    >
                      {copy.cancelLabel}
                    </button>
                    <button
                      type="button"
                      data-seum-confirm-confirm=""
                      data-tone={tone}
                      onClick={async () => {
                        if (!onConfirm) {
                          resolve({ status: 'confirmed' })
                          return
                        }

                        transition('loading')

                        try {
                          await onConfirm()

                          if (options.success === false || options.success === undefined) {
                            resolve({ status: 'confirmed' })
                            return
                          }

                          transition('success')
                        } catch (error) {
                          transition('error', { error })
                        }
                      }}
                    >
                      {copy.confirmLabel}
                    </button>
                  </>
                )}
              </div>
            </DialogPresetShell>
          )
        },
        { initialData: { error: undefined }, ...dialogOptions },
      )

      const result = await flowHandle.result
      return result.status === 'dismissed' ? { status: 'dismissed' } : result.value
    },
    [flow],
  )

  const close = useCallback((id: string) => {
    dismissDialog(id)
  }, [])

  return { open, flow, alert, confirm, close }
}
