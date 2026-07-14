import {
  DEFAULT_DIALOG_OPTIONS,
  type DialogDataUpdater,
  type DialogOptions,
  type DialogResult,
  generateId,
  overlayStore,
} from '@woon-ui/primitive'
import { useCallback } from 'react'

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

type OpenDialogOptions<TData> = Partial<DialogOptions> & {
  initialData?: TData
}

export function useDialog() {
  const open = useCallback(
    <TData = undefined, TResult = void>(
      render: (ctx: DialogContext<TData, TResult>) => React.ReactNode,
      options?: OpenDialogOptions<TData>,
    ): DialogHandle<TData, TResult> => {
      const id = generateId()
      const { initialData, ...dialogOptions } = options ?? {}

      const close = () => {
        overlayStore.settle(id, { status: 'dismissed', value: undefined })
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
    overlayStore.settle(id, { status: 'dismissed', value: undefined })
    overlayStore.pop(id)
  }, [])

  const closeAll = useCallback(() => {
    overlayStore.popAll()
  }, [])

  return { open, close, closeAll }
}
