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
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  tone?: DialogPresetTone
}

export function DialogPresetShell({
  title,
  description,
  children,
  tone = 'default',
}: DialogPresetShellProps) {
  return (
    <DialogRoot>
      <DialogOverlay />
      <DialogContent data-woon-dialog-preset data-tone={tone}>
        {title !== undefined && <DialogTitle>{title}</DialogTitle>}
        {description !== undefined && <DialogDescription>{description}</DialogDescription>}
        {children}
      </DialogContent>
    </DialogRoot>
  )
}
