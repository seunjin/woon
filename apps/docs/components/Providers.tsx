'use client'

import { ModalRoot } from '@woon-ui/dialog'
import { Toaster } from '@woon-ui/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ModalRoot />
      <Toaster position="bottom-right" />
    </>
  )
}
