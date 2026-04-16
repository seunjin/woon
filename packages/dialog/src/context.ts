import { createSafeContext } from '@woon-ui/primitive'

export type DialogCompoundContextValue = {
  titleId: string
  descriptionId: string
}

export const [DialogCompoundContext, useDialogCompoundContext] =
  createSafeContext<DialogCompoundContextValue>('Dialog.Content')
