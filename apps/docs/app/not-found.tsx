import Link from 'next/link'

export default function NotFound() {
  return (
    <main>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>요청한 문서가 없거나 이동되었습니다.</p>
      <Link href="/docs">문서로 돌아가기</Link>
    </main>
  )
}
