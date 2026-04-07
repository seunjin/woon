import { useEffect, useId, useRef } from 'react'
import { SeumDialogContext, useSeumDialogContext } from '../../core/overlay-engine/dialog-context'
import { getFocusableElements, trapFocus } from '../../core/overlay-engine/focus-trap'
import type { DialogOptions } from '../../core/overlay-engine/types'
import { Slot } from '../../core/shared/slot'
import { DialogCompoundContext, useDialogCompoundContext } from './context'

// ─── Dialog.Root ─────────────────────────────────────────────────────────────

type DialogRootProps = {
  children?: React.ReactNode
  options?: Partial<DialogOptions>
}

/**
 * 컴포넌트 레벨 기본 옵션을 선언합니다.
 * 우선순위: DEFAULT → Dialog.Root options → dialog.open() 명시 옵션
 */
export function DialogRoot({ children, options }: DialogRootProps) {
  const ctx = useSeumDialogContext()

  const mergedOptions: DialogOptions = {
    ...ctx.options, // dialog 인스턴스 기본값 (alert/confirm 전용 기본값 포함)
    ...options, // Dialog.Root 레벨 오버라이드
    ...ctx.explicitOptions, // dialog.open() 명시값이 최우선
  }

  return (
    <SeumDialogContext value={{ ...ctx, options: mergedOptions }}>{children}</SeumDialogContext>
  )
}

// ─── Dialog.Overlay ───────────────────────────────────────────────────────────
// 순수 backdrop. Root 안에서 Content와 형제로 배치.
// overlay={false}인 경우 렌더하지 않으면 됨 (조건부 렌더는 사용자 몫).

type DialogOverlayProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>

export function DialogOverlay({ style, onClick, ...props }: DialogOverlayProps) {
  const ctx = useSeumDialogContext()

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
    />
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
  Root: DialogRoot,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
}
