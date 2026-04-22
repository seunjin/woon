import type { DialogPresetTone } from '@woon-ui/primitive'
import type * as React from 'react'
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogRoot,
  DialogTitle,
} from './primitives'

interface DialogPresetShellProps {
  variant: 'alert' | 'confirm'
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  tone?: DialogPresetTone
}

export function DialogPresetShell({
  variant,
  title,
  description,
  children,
  tone = 'default',
}: DialogPresetShellProps) {
  const overlayProps =
    variant === 'alert'
      ? {
          'data-woon-alert-overlay': '',
          'data-woon-dialog-overlay': undefined,
        }
      : {
          'data-woon-confirm-overlay': '',
          'data-woon-dialog-overlay': undefined,
        }
  const contentProps =
    variant === 'alert'
      ? {
          'data-woon-alert-content': '',
          'data-woon-dialog-content': undefined,
        }
      : {
          'data-woon-confirm-content': '',
          'data-woon-dialog-content': undefined,
        }
  const titleProps =
    variant === 'alert'
      ? {
          'data-woon-alert-title': '',
          'data-woon-dialog-title': undefined,
        }
      : {
          'data-woon-confirm-title': '',
          'data-woon-dialog-title': undefined,
        }
  const descriptionProps =
    variant === 'alert'
      ? {
          'data-woon-alert-description': '',
          'data-woon-dialog-description': undefined,
        }
      : {
          'data-woon-confirm-description': '',
          'data-woon-dialog-description': undefined,
        }

  return (
    <DialogRoot>
      <DialogOverlay {...overlayProps} />
      <DialogContent data-woon-dialog-preset data-tone={tone} {...contentProps}>
        {title !== undefined && <DialogTitle {...titleProps}>{title}</DialogTitle>}
        {description !== undefined && (
          <DialogDescription {...descriptionProps}>{description}</DialogDescription>
        )}
        {children}
      </DialogContent>
    </DialogRoot>
  )
}
