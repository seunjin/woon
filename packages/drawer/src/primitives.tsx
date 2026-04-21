import { Dialog } from '@woon-ui/dialog'
import type { DialogOptions } from '@woon-ui/primitive'
import type * as React from 'react'
import { DrawerContext, type DrawerDirection, useDrawerContext } from './context'

type DrawerRootProps = {
  children?: React.ReactNode
  direction?: DrawerDirection
  onOpenChange?: (open: boolean) => void
  options?: Partial<DialogOptions>
}

export interface DrawerContentProps extends React.ComponentProps<typeof Dialog.Content> {}

export interface DrawerOverlayProps extends React.ComponentProps<typeof Dialog.Overlay> {}
export interface DrawerTitleProps extends React.ComponentProps<typeof Dialog.Title> {}
export interface DrawerDescriptionProps extends React.ComponentProps<typeof Dialog.Description> {}
export interface DrawerCloseProps extends React.ComponentProps<typeof Dialog.Close> {}

export function DrawerRoot(props: DrawerRootProps) {
  const { children, direction = 'right', onOpenChange, options } = props
  const rootProps = {
    ...(onOpenChange ? { onOpenChange } : {}),
    ...(options ? { options } : {}),
  }
  const contextValue = { direction }

  return (
    <Dialog.Root {...rootProps}>
      <DrawerContext value={contextValue}>{children}</DrawerContext>
    </Dialog.Root>
  )
}

export function DrawerOverlay(props: DrawerOverlayProps) {
  return <Dialog.Overlay data-woon-drawer-overlay {...props} />
}

export function DrawerContent(props: DrawerContentProps) {
  const { style, ...contentProps } = props
  const { direction } = useDrawerContext()

  return (
    <Dialog.Content
      data-woon-drawer-content
      data-direction={direction}
      style={style}
      {...contentProps}
    />
  )
}

export function DrawerTitle(props: DrawerTitleProps) {
  return <Dialog.Title data-woon-drawer-title {...props} />
}

export function DrawerDescription(props: DrawerDescriptionProps) {
  return <Dialog.Description data-woon-drawer-description {...props} />
}

export function DrawerClose(props: DrawerCloseProps) {
  return <Dialog.Close data-woon-drawer-close {...props} />
}

export type DrawerComponents = {
  Root: React.ComponentType<DrawerRootProps>
  Overlay: React.ComponentType<DrawerOverlayProps>
  Content: React.ComponentType<DrawerContentProps>
  Title: React.ComponentType<DrawerTitleProps>
  Description: React.ComponentType<DrawerDescriptionProps>
  Close: React.ComponentType<DrawerCloseProps>
}

export const Drawer: DrawerComponents = {
  Root: DrawerRoot,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
}

export type { DrawerRootProps }
