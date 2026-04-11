'use client'

import { SeumProvider } from '@woon/core'
import { dialogPlugin } from '@woon/core/dialog'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SeumProvider plugins={[dialogPlugin()]}>{children}</SeumProvider>
}
