import { createSafeContext } from '@woon-ui/primitive'

export type DrawerDirection = 'left' | 'right' | 'top' | 'bottom'

export type DrawerContextValue = {
  direction: DrawerDirection
}

export const [DrawerContext, useDrawerContext] = createSafeContext<DrawerContextValue>('Drawer')
