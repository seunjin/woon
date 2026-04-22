import type {
  DialogFlowStep,
  DialogMessageStep,
  DialogOptions,
  DialogPresetTone,
  DialogResult,
} from '@woon-ui/primitive'
import {
  DEFAULT_DIALOG_OPTIONS,
  generateId,
  getWoonDefaults,
  overlayStore,
} from '@woon-ui/primitive'
import type * as React from 'react'
import { DialogPresetShell } from './preset-shell'

// ─── Types ────────────────────────────────────────────────────────────────────

export type { DialogFlowStep, DialogMessageStep, DialogPresetTone }

export type DialogConfirmResult =
  | { status: 'confirmed' }
  | { status: 'cancelled' }
  | { status: 'dismissed'; value: undefined }

export type DialogConfirmErrorConfig = DialogMessageStep | ((error: unknown) => DialogMessageStep)

export type ConfirmRenderContext = {
  options: DialogConfirmOptions
  step: DialogFlowStep
  error: unknown
  onConfirm: () => void
  onCancel: () => void
  // step 기반으로 계산된 표시값 — 컴포넌트에서 step 분기 없이 바로 사용 가능
  title: React.ReactNode
  description: React.ReactNode | undefined
  confirmLabel: React.ReactNode
  cancelLabel: React.ReactNode | undefined
  showCancel: boolean
}

export type DialogConfirmOptions = Partial<DialogOptions> & {
  title?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  tone?: DialogPresetTone
  onConfirm?: () => void | Promise<void>
  loading?: Omit<DialogMessageStep, 'cancelLabel'>
  success?: Omit<DialogMessageStep, 'cancelLabel'>
  error?: DialogConfirmErrorConfig
  retryOnError?: boolean
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
    const copy = options.loading ?? {}
    return {
      title: copy.title ?? '처리 중입니다',
      description: copy.description ?? options.description ?? '잠시만 기다려주세요.',
      confirmLabel: copy.confirmLabel ?? '처리 중',
    }
  }

  if (step === 'success') {
    const copy = options.success ?? {}
    return {
      title: copy.title ?? '완료되었습니다',
      description: copy.description ?? options.description,
      confirmLabel: copy.confirmLabel ?? '확인',
    }
  }

  // error
  const copy = typeof options.error === 'function' ? options.error(error) : (options.error ?? {})

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

function DefaultConfirm({
  options,
  step,
  title,
  description,
  confirmLabel,
  cancelLabel,
  showCancel,
  onConfirm,
  onCancel,
}: ConfirmRenderContext) {
  const { tone = 'default' } = options

  return (
    <DialogPresetShell variant="confirm" title={title} description={description} tone={tone}>
      <div data-woon-confirm-actions="" data-step={step}>
        {showCancel && (
          <button type="button" data-woon-confirm-cancel="" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
        <button
          type="button"
          data-woon-confirm-confirm=""
          data-tone={tone}
          disabled={step === 'loading'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </DialogPresetShell>
  )
}

// ─── confirm() ────────────────────────────────────────────────────────────────

export async function confirm(options: DialogConfirmOptions): Promise<DialogConfirmResult> {
  const { render, onConfirm, ...dialogOptions } = options
  const { confirm: CustomConfirm } = getWoonDefaults()

  const id = generateId()

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

        if (options.success === undefined) {
          resolve({ status: 'confirmed' })
          return
        }

        transition(id, 'success')
      } catch (err) {
        if (options.retryOnError) {
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

        const copy = getStepCopy(step, options, error)
        const ctx: ConfirmRenderContext = {
          options,
          step,
          error,
          onConfirm: handleConfirmForStep,
          onCancel: () => typedResolve({ status: 'cancelled' }),
          title: copy.title,
          description: copy.description,
          confirmLabel: copy.confirmLabel,
          cancelLabel: copy.cancelLabel,
          showCancel: step === 'confirm' || step === 'error',
        }

        // 우선순위: render prop > dialogPlugin render.confirm > DefaultConfirm
        if (render) return render(ctx)
        if (CustomConfirm) return <CustomConfirm {...ctx} />
        return <DefaultConfirm {...ctx} />
      },
      options: { ...DEFAULT_DIALOG_OPTIONS, closeOnOverlayClick: false, ...dialogOptions },
      settle: settleUnknown,
    })
  })

  return result.status === 'dismissed' ? { status: 'dismissed', value: undefined } : result.value
}
