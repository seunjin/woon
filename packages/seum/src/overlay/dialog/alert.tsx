import type * as React from 'react'
import type { DialogPresetTone } from '../../core/overlay-engine/dialog-context'
import { overlayStore } from '../../core/overlay-engine/store'
import type { DialogOptions, DialogResult } from '../../core/overlay-engine/types'
import { DEFAULT_DIALOG_OPTIONS } from '../../core/overlay-engine/types'
import { DialogPresetShell } from './preset-shell'

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

export async function alert(options: DialogAlertOptions): Promise<DialogAlertResult> {
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

  const id = crypto.randomUUID()

  const result = await new Promise<DialogResult<DialogAlertResult>>((settle) => {
    const settleUnknown = settle as (result: DialogResult<unknown>) => void
    overlayStore.push({
      id,
      data: undefined,
      render: ({ resolve }) => (
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
      options: { ...DEFAULT_DIALOG_OPTIONS, ...dialogOptions },
      settle: settleUnknown,
    })
  })

  return result.status === 'dismissed' ? { status: 'dismissed' } : result.value
}
