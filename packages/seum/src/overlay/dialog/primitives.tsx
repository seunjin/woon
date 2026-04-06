import { useEffect, useId, useRef } from 'react'
import { useSeumDialogContext } from '../../core/overlay-engine/dialog-context'
import { getFocusableElements, trapFocus } from '../../core/overlay-engine/focus-trap'
import { Slot } from '../../core/shared/slot'
import { DialogCompoundContext, useDialogCompoundContext } from './context'

interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function DialogOverlay({ children, style, onClick, ...props }: DialogOverlayProps) {
  const ctx = useSeumDialogContext()

  if (!ctx.options.overlay) {
    return <>{children}</>
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    onClick?.(e)
    if (ctx.options.closeOnOverlayClick && e.target === e.currentTarget) {
      ctx.close()
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismissal is handled by pointer interaction while Escape covers keyboard dismissal.
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop is not intended to be keyboard-focusable.
    <div
      data-seum-dialog-overlay
      data-state={ctx.status}
      style={{ ...style, zIndex: ctx.zIndex }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function DialogContent({ children, style, ...props }: DialogContentProps) {
  const ctx = useSeumDialogContext()
  const contentRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null

    const focusable = contentRef.current ? getFocusableElements(contentRef.current) : []
    const target = focusable[0] ?? contentRef.current
    target?.focus()

    return () => {
      prev?.focus()
    }
  }, [])

  useEffect(() => {
    if (!ctx.options.modal) return

    function handleKeyDown(e: KeyboardEvent) {
      if (contentRef.current) trapFocus(contentRef.current, e)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [ctx.options.modal])

  return (
    <DialogCompoundContext value={{ titleId, descriptionId }}>
      <div
        ref={contentRef}
        role="dialog"
        aria-modal={ctx.options.modal}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-hidden={ctx.status === 'closed' ? true : undefined}
        data-seum-dialog-content
        data-state={ctx.status}
        style={{ ...style, zIndex: ctx.zIndex }}
        tabIndex={-1}
        {...props}
      >
        {children}
      </div>
    </DialogCompoundContext>
  )
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function DialogTitle({ asChild, children, ...props }: DialogTitleProps) {
  const ctx = useDialogCompoundContext()
  const Comp = asChild ? Slot : 'h2'

  return (
    <Comp id={ctx.titleId} data-seum-dialog-title {...props}>
      {children}
    </Comp>
  )
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function DialogDescription({ asChild, children, ...props }: DialogDescriptionProps) {
  const ctx = useDialogCompoundContext()
  const Comp = asChild ? Slot : 'p'

  return (
    <Comp id={ctx.descriptionId} data-seum-dialog-description {...props}>
      {children}
    </Comp>
  )
}

interface DialogCloseProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function DialogClose({ asChild, children, onClick, ...props }: DialogCloseProps) {
  const ctx = useSeumDialogContext()
  const Comp = asChild ? Slot : 'button'

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e as React.MouseEvent<HTMLButtonElement>)
    ctx.close()
  }

  return (
    <Comp data-seum-dialog-close onClick={handleClick} {...props}>
      {children}
    </Comp>
  )
}

export const Dialog = {
  Overlay: DialogOverlay,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
}
