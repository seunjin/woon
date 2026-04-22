'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const TARGET_HREF = '/docs/components/drawer'

export default function BottomSheetRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(TARGET_HREF)
  }, [router])

  return (
    <main
      style={{
        minHeight: '60dvh',
        display: 'grid',
        placeItems: 'center',
        padding: '4rem 1.5rem',
      }}
    >
      <div
        style={{
          width: 'min(100%, 36rem)',
          display: 'grid',
          gap: 12,
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Bottom Sheet가 Drawer로 이동했습니다.
        </h1>
        <p style={{ color: '#52525b', lineHeight: 1.7 }}>
          기존 Bottom Sheet 문서는 제거되었고, 모바일 sheet UI는 Drawer로 통합되었습니다.
        </p>
        <p>
          <Link href={TARGET_HREF} style={{ textDecoration: 'underline' }}>
            Drawer 문서로 이동
          </Link>
        </p>
      </div>
    </main>
  )
}
