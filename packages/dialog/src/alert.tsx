import type { DialogOptions, DialogPresetTone } from '@woon-ui/primitive'
import {
  DEFAULT_DIALOG_OPTIONS,
  generateId,
  getWoonDefaults,
  overlayStore,
} from '@woon-ui/primitive'
import type * as React from 'react'
import { DialogPresetShell } from './preset-shell'

export type AlertRenderContext = {
  options: DialogAlertOptions
  close: () => void
}

export type DialogAlertOptions = Partial<DialogOptions> & {
  title?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  tone?: DialogPresetTone
  render?: (ctx: AlertRenderContext) => React.ReactNode
}

function DefaultAlert({ options, close }: AlertRenderContext) {
  const { title, description, confirmLabel = '확인', tone = 'default' } = options

  return (
    <DialogPresetShell variant="alert" title={title} description={description} tone={tone}>
      <div data-woon-alert-actions="">
        <button type="button" data-woon-alert-confirm="" data-tone={tone} onClick={close}>
          {confirmLabel}
        </button>
      </div>
    </DialogPresetShell>
  )
}

export async function alert(options: DialogAlertOptions): Promise<void> {
  const { render, ...dialogOptions } = options
  const { alert: CustomAlert } = getWoonDefaults()

  const id = generateId()

  await new Promise<void>((resolve) => {
    overlayStore.push({
      id,
      data: undefined,
      render: ({ close }) => {
        const ctx: AlertRenderContext = { options, close }

        // 우선순위: render prop > ModalRoot components.alert > DefaultAlert
        if (render) return render(ctx)
        if (CustomAlert) return <CustomAlert {...ctx} />
        return <DefaultAlert {...ctx} />
      },
      options: { ...DEFAULT_DIALOG_OPTIONS, closeOnOverlayClick: false, ...dialogOptions },
      settle: () => resolve(),
    })
  })
}
