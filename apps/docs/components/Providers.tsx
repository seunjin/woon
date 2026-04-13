'use client'

import { WoonProvider } from '@woon/core'
import { dialogPlugin } from '@woon/core/dialog'
import { toastPlugin } from '@woon/core/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WoonProvider plugins={[dialogPlugin(), toastPlugin({ position: 'bottom-right' })]}>
      {children}
    </WoonProvider>
  )
}
