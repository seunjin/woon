import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Providers } from '@/components/Providers'
import './globals.css'

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Woon — Headless UI for React',
  description: 'UX와 접근성을 강제하는 React 헤드리스 UI 라이브러리',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
