import type * as React from 'react'
import type {
  DialogFlowStep,
  DialogMessageStep,
  DialogPresetTone,
} from '../../core/overlay-engine/dialog-context'
import { overlayStore } from '../../core/overlay-engine/store'
import type { DialogOptions, DialogResult } from '../../core/overlay-engine/types'
import { DEFAULT_DIALOG_OPTIONS } from '../../core/overlay-engine/types'
import { getSeumDefaults } from '../../core/seum-config-context'
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

export type ConfirmRenderContext = {
  options: DialogConfirmOptions
  step: DialogFlowStep
  error: unknown
  onConfirm: () => void
  onCancel: () => void
}

export type DialogConfirmOptions = Partial<DialogOptions> & {
  title?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  tone?: DialogPresetTone
  onConfirm?: () => void | Promise<void>
  loading?: Omit<DialogMessageStep, 'cancelLabel'> | false
  success?: Omit<DialogMessageStep, 'cancelLabel'> | false
  error?: DialogConfirmErrorConfig
  render?: (ctx: ConfirmRenderContext) => React.ReactNode
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

// ─── DefaultConfirm ───────────────────────────────────────────────────────────

function DefaultConfirm({ options, step, error, onConfirm, onCancel }: ConfirmRenderContext) {
  const { tone = 'default' } = options
  const copy = getStepCopy(step, options, error)

  return (
    <DialogPresetShell title={copy.title} description={copy.description} tone={tone}>
      <div data-seum-confirm-actions="" data-step={step}>
        {step === 'confirm' && (
          <>
            <button type="button" data-seum-confirm-cancel="" onClick={onCancel}>
              {copy.cancelLabel}
            </button>
            <button type="button" data-seum-confirm-confirm="" data-tone={tone} onClick={onConfirm}>
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
          <button type="button" data-seum-confirm-confirm="" data-tone={tone} onClick={onConfirm}>
            {copy.confirmLabel}
          </button>
        )}
        {step === 'error' && (
          <>
            <button type="button" data-seum-confirm-cancel="" onClick={onCancel}>
              {copy.cancelLabel}
            </button>
            <button type="button" data-seum-confirm-confirm="" data-tone={tone} onClick={onConfirm}>
              {copy.confirmLabel}
            </button>
          </>
        )}
      </div>
    </DialogPresetShell>
  )
}

// ─── confirm() ────────────────────────────────────────────────────────────────

export async function confirm(options: DialogConfirmOptions): Promise<DialogConfirmResult> {
  const { render, onConfirm, ...dialogOptions } = options
  const { confirm: CustomConfirm } = getSeumDefaults()

  const id = crypto.randomUUID()

  const result = await new Promise<DialogResult<DialogConfirmResult>>((settle) => {
    const settleUnknown = settle as (result: DialogResult<unknown>) => void

    // onConfirm 핸들러 — loading/success/error 흐름 관리
    async function handleConfirm(resolve: (value: DialogConfirmResult) => void) {
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
    }

    overlayStore.push({
      id,
      data: { step: 'confirm', error: undefined } satisfies ConfirmFlowData,
      render: ({ data, resolve }) => {
        const { step, error } = data as ConfirmFlowData
        const typedResolve = resolve as (value: DialogConfirmResult) => void

        // success step에서는 재실행 없이 바로 resolve
        const handleConfirmForStep =
          step === 'success'
            ? () => typedResolve({ status: 'confirmed' })
            : () => handleConfirm(typedResolve)

        const ctx: ConfirmRenderContext = {
          options,
          step,
          error,
          onConfirm: handleConfirmForStep,
          onCancel: () => typedResolve({ status: 'cancelled' }),
        }

        // 우선순위: render prop > SeumProvider defaults.confirm > DefaultConfirm
        if (render) return render(ctx)
        if (CustomConfirm) return <CustomConfirm {...ctx} />
        return <DefaultConfirm {...ctx} />
      },
      options: { ...DEFAULT_DIALOG_OPTIONS, closeOnOverlayClick: false, ...dialogOptions },
      settle: settleUnknown,
    })
  })

  return result.status === 'dismissed' ? { status: 'dismissed' } : result.value
}
