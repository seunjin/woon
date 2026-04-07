import type * as React from 'react'
import type { DialogPresetTone } from '../../core/overlay-engine/dialog-context'
import { overlayStore } from '../../core/overlay-engine/store'
import type { DialogOptions } from '../../core/overlay-engine/types'
import { DEFAULT_DIALOG_OPTIONS } from '../../core/overlay-engine/types'
import { getSeumDefaults } from '../../core/seum-config-context'
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
    <DialogPresetShell title={title} description={description} tone={tone}>
      <div data-seum-alert-actions="">
        <button type="button" data-seum-alert-confirm="" data-tone={tone} onClick={close}>
          {confirmLabel}
        </button>
      </div>
    </DialogPresetShell>
  )
}

export async function alert(options: DialogAlertOptions): Promise<void> {
  const { render, ...dialogOptions } = options
  const { alert: CustomAlert } = getSeumDefaults()

  const id = crypto.randomUUID()

  await new Promise<void>((resolve) => {
    overlayStore.push({
      id,
      data: undefined,
      render: ({ close }) => {
        const ctx: AlertRenderContext = { options, close }

        // 우선순위: render prop > SeumProvider defaults.alert > DefaultAlert
        if (render) return render(ctx)
        if (CustomAlert) return <CustomAlert {...ctx} />
        return <DefaultAlert {...ctx} />
      },
      options: { ...DEFAULT_DIALOG_OPTIONS, closeOnOverlayClick: false, ...dialogOptions },
      settle: () => resolve(),
    })
  })
}
