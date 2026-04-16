import type { DialogOptions } from '@woon-ui/primitive'
import {
  getFocusableElements,
  Slot,
  trapFocus,
  useWoonDialogContext,
  WoonDialogContext,
} from '@woon-ui/primitive'
import { useEffect, useId, useRef } from 'react'
import { DialogCompoundContext, useDialogCompoundContext } from './context'

// ─── Dialog.Root ─────────────────────────────────────────────────────────────

type DialogRootProps = {
  children?: React.ReactNode
  /**
   * 컴포넌트 레벨 기본 옵션. 이 컴포넌트를 사용하는 모든 다이얼로그 인스턴스에 적용됩니다.
   *
   * 옵션 우선순위 (낮음 → 높음):
   * 1. `DEFAULT_DIALOG_OPTIONS` — 라이브러리 기본값
   * 2. `Dialog.Root options` — 이 prop
   * 3. `dialog.open()` 명시 옵션 — 호출 시 직접 전달한 값이 최우선
   *
   * @example
   * // 사이드패널: 오버레이·포커스트랩·스크롤잠금 모두 비활성
   * <Dialog.Root options={{ overlay: false, trapFocus: false, scrollLock: false }}>
   */
  options?: Partial<DialogOptions>
}

export function DialogRoot({ children, options }: DialogRootProps) {
  const ctx = useWoonDialogContext()

  const mergedOptions: DialogOptions = {
    ...ctx.options, // dialog 인스턴스 기본값 (alert/confirm 전용 기본값 포함)
    ...options, // Dialog.Root 레벨 오버라이드
    ...ctx.explicitOptions, // dialog.open() 명시값이 최우선
  }

  return (
    <WoonDialogContext value={{ ...ctx, options: mergedOptions }}>{children}</WoonDialogContext>
  )
}

// ─── Dialog.Overlay ───────────────────────────────────────────────────────────
// 순수 backdrop. Root 안에서 Content와 형제로 배치.
// overlay={false}인 경우 렌더하지 않으면 됨 (조건부 렌더는 사용자 몫).

type DialogOverlayProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>

export function DialogOverlay({ style, onClick, ...props }: DialogOverlayProps) {
  const ctx = useWoonDialogContext()

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
      data-woon-dialog-overlay
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
  const ctx = useWoonDialogContext()
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
    if (!ctx.options.trapFocus) return

    function handleKeyDown(e: KeyboardEvent) {
      if (contentRef.current) trapFocus(contentRef.current, e)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [ctx.options.trapFocus])

  return (
    <DialogCompoundContext value={{ titleId, descriptionId }}>
      <div
        ref={contentRef}
        role="dialog"
        aria-modal={ctx.options.trapFocus}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-hidden={ctx.status === 'closed' ? true : undefined}
        data-woon-dialog-content
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
    <Comp id={ctx.titleId} data-woon-dialog-title {...props}>
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
    <Comp id={ctx.descriptionId} data-woon-dialog-description {...props}>
      {children}
    </Comp>
  )
}

interface DialogCloseProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children?: React.ReactNode
}

export function DialogClose({ asChild, children, onClick, ...props }: DialogCloseProps) {
  const ctx = useWoonDialogContext()
  const Comp = asChild ? Slot : 'button'

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e as React.MouseEvent<HTMLButtonElement>)
    ctx.close()
  }

  return (
    <Comp data-woon-dialog-close onClick={handleClick} {...props}>
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
