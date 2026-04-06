import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="seum-home">
      <section className="seum-home-hero">
        <div className="seum-home-copy">
          <div className="seum-home-eyebrow">Not found</div>
          <h1 className="seum-home-title">요청한 페이지를 찾을 수 없습니다.</h1>
          <p className="seum-home-description">
            문서가 이동되었거나 경로가 잘못되었을 수 있습니다. 시작하기 문서나 Dialog 문서로 다시
            진입하는 편이 가장 빠릅니다.
          </p>
          <div className="seum-home-actions">
            <Link className="seum-docs-button is-primary" href="/docs">
              문서 홈으로
            </Link>
            <Link className="seum-docs-button is-ghost" href="/docs/components/dialog">
              Dialog 문서 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
