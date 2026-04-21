import { createSafeContext } from '@woon-ui/primitive'

export type DrawerDirection = 'left' | 'right' | 'top' | 'bottom'

export type DrawerDragVisualState = {
  progress: number
  transition: string | null
}

export type DrawerContextValue = {
  direction: DrawerDirection
  dragToClose: boolean
  dragVisualState: DrawerDragVisualState
  setDragVisualState: (state: DrawerDragVisualState) => void
}

export const [DrawerContext, useDrawerContext] = createSafeContext<DrawerContextValue>('Drawer')
