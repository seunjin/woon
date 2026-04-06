'use client'

import type { ReactNode } from 'react'
import { DocsProviders } from '@/components/docs-providers'
import 'fumadocs-ui/style.css'
import 'seum/css/tokens'
import 'seum/css/dialog'
import './globals.css'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <DocsProviders>{children}</DocsProviders>
      </body>
    </html>
  )
}
