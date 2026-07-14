'use client'

import { DialogRuntime } from '@woon-ui/dialog'
import { Toaster } from '@woon-ui/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <DialogRuntime />
      <Toaster position="bottom-right" />
    </>
  )
}
