import type { ReactNode } from 'react'

import './globals.css'

export const metadata = {
  title: 'Woon CLI Next Fixture',
  description: 'App Router fixture for Woon CLI smoke tests',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
