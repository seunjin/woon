import type { FeatureDefinition } from './types'

function cssTemplate(packageName: string): string {
  return `@import '${packageName}/css';

/* Add local overrides here. */
`
}

function dialogTemplate(): string {
  return `import type { ReactNode } from 'react'

import './dialog.css'

import { Dialog as DialogPrimitive, useWoonDialogContext } from '@woon-ui/dialog'

export interface DialogProps {
  title: string
  description?: string
  children?: ReactNode
}

export function Dialog({ title, description, children }: DialogProps) {
  const { close } = useWoonDialogContext()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Overlay />
      <DialogPrimitive.Content>
        <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
        {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
        {children}
        <div>
          <DialogPrimitive.Close asChild>
            <button type="button" onClick={close}>
              Close
            </button>
          </DialogPrimitive.Close>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}

export { DialogPrimitive }
`
}

function toastTemplate(): string {
  return `import './toast.css'

import type { ToastDefaultRenderProps } from '@woon-ui/toast'

export type ToastProps = ToastDefaultRenderProps

export function Toast({ title, description, action, close }: ToastProps) {
  return (
    <>
      <div data-woon-toast-body>
        <span data-woon-toast-title>{title}</span>
        {description && <span data-woon-toast-description>{description}</span>}
      </div>
      <div data-woon-toast-actions>
        {action && (
          <button type="button" data-woon-toast-action onClick={action.onClick}>
            {action.label}
          </button>
        )}
        <button type="button" data-woon-toast-close onClick={close} aria-label="Close">
          x
        </button>
      </div>
    </>
  )
}
`
}

function reExportTemplate(feature: FeatureDefinition): string {
  return `import './${feature.name}.css'

export { ${feature.exportName} } from '${feature.packageName}'
`
}

export function getScaffoldFiles(
  feature: FeatureDefinition,
): Array<{ name: string; content: string }> {
  const cssContent = cssTemplate(feature.packageName)

  if (feature.template === 'dialog') {
    return [
      { name: 'dialog.tsx', content: dialogTemplate() },
      { name: 'dialog.css', content: cssContent },
    ]
  }

  if (feature.template === 'toast') {
    return [
      { name: 'toast.tsx', content: toastTemplate() },
      { name: 'toast.css', content: cssContent },
    ]
  }

  return [
    { name: `${feature.name}.tsx`, content: reExportTemplate(feature) },
    { name: `${feature.name}.css`, content: cssContent },
  ]
}
