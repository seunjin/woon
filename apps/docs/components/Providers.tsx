'use client'

import { dialogPlugin } from '@woon-ui/dialog'
import { WoonProvider } from '@woon-ui/react'
import { toastPlugin } from '@woon-ui/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WoonProvider plugins={[dialogPlugin(), toastPlugin({ position: 'bottom-right' })]}>
      {children}
    </WoonProvider>
  )
}
