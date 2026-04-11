'use client'

import { SeumProvider } from '@woon/core'

// 문서 내 인터랙티브 예제에서 SeumProvider 기능이 필요할 때 여기에 플러그인 추가
export function Providers({ children }: { children: React.ReactNode }) {
  return <SeumProvider>{children}</SeumProvider>
}
