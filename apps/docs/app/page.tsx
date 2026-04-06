import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      <h1>Seum (세움)</h1>
      <p>UI의 기틀을 세우다.</p>
      <p>헤드리스 UI 라이브러리 — 구조와 접근성은 Seum이, 스타일은 당신이.</p>
      <Link href="/docs">문서 보기 →</Link>
    </main>
  )
}
