import type * as React from 'react'
import type { DialogPresetTone } from '../../core/overlay-engine/dialog-context'
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
  overlayProps?: Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> | undefined
  contentProps?: React.HTMLAttributes<HTMLDivElement> | undefined
}

export function DialogPresetShell({
  title,
  description,
  children,
  tone = 'default',
  overlayProps,
  contentProps,
}: DialogPresetShellProps) {
  return (
    <DialogRoot>
      <DialogOverlay {...(overlayProps ?? {})} />
      <DialogContent data-seum-dialog-preset data-tone={tone} {...(contentProps ?? {})}>
        {title !== undefined && <DialogTitle>{title}</DialogTitle>}
        {description !== undefined && <DialogDescription>{description}</DialogDescription>}
        {children}
      </DialogContent>
    </DialogRoot>
  )
}
