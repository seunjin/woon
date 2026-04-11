import { createSafeContext } from '../../core/shared/create-safe-context'

export type DialogCompoundContextValue = {
  titleId: string
  descriptionId: string
}

export const [DialogCompoundContext, useDialogCompoundContext] =
  createSafeContext<DialogCompoundContextValue>('Dialog.Content')
