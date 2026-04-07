import type * as React from 'react'
import type {
  DialogFlowStep,
  DialogMessageStep,
  DialogPresetTone,
} from '../../core/overlay-engine/dialog-context'
import { overlayStore } from '../../core/overlay-engine/store'
import type { DialogOptions, DialogResult } from '../../core/overlay-engine/types'
import { DEFAULT_DIALOG_OPTIONS } from '../../core/overlay-engine/types'
import { DialogPresetShell } from './preset-shell'

// ─── Types ────────────────────────────────────────────────────────────────────

export type { DialogFlowStep, DialogMessageStep, DialogPresetTone }

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

// ─── Internal ─────────────────────────────────────────────────────────────────

type ConfirmFlowData = {
  step: DialogFlowStep
  error: unknown
}

function getStepCopy(
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

  // error
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

function transition(id: string, step: DialogFlowStep, error?: unknown) {
  overlayStore.update(id, (prev: unknown) => {
    const current = prev as ConfirmFlowData
    return { step, error: error ?? current.error }
  })
}

// ─── confirm() ────────────────────────────────────────────────────────────────

export async function confirm(options: DialogConfirmOptions): Promise<DialogConfirmResult> {
  const {
    tone = 'default',
    overlayProps,
    contentProps,
    confirmButtonProps,
    cancelButtonProps,
    onConfirm,
    ...dialogOptions
  } = options

  const id = crypto.randomUUID()

  const result = await new Promise<DialogResult<DialogConfirmResult>>((settle) => {
    const settleUnknown = settle as (result: DialogResult<unknown>) => void
    overlayStore.push({
      id,
      data: { step: 'confirm', error: undefined } satisfies ConfirmFlowData,
      render: ({ data, resolve }) => {
        const { step, error } = data as ConfirmFlowData
        const copy = getStepCopy(step, options, error)

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

                      transition(id, 'loading')

                      try {
                        await onConfirm()

                        if (options.success === false || options.success === undefined) {
                          resolve({ status: 'confirmed' })
                          return
                        }

                        transition(id, 'success')
                      } catch (err) {
                        if (options.error === false) {
                          transition(id, 'confirm', err)
                          return
                        }
                        transition(id, 'error', err)
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

                      transition(id, 'loading')

                      try {
                        await onConfirm()

                        if (options.success === false || options.success === undefined) {
                          resolve({ status: 'confirmed' })
                          return
                        }

                        transition(id, 'success')
                      } catch (err) {
                        transition(id, 'error', err)
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
      options: { ...DEFAULT_DIALOG_OPTIONS, ...dialogOptions },
      settle: settleUnknown,
    })
  })

  return result.status === 'dismissed' ? { status: 'dismissed' } : result.value
}
