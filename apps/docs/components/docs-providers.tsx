'use client'

import { RootProvider } from 'fumadocs-ui/provider'
import type { ReactNode } from 'react'
import { SeumProvider } from 'seum'

export function DocsProviders({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <SeumProvider>{children}</SeumProvider>
    </RootProvider>
  )
}
