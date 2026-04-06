import Link from 'next/link'
import { DialogDocsDemo } from '@/components/dialog-docs-demo'

export default function HomePage() {
  return (
    <main className="seum-home">
      <section className="seum-home-hero">
        <div className="seum-home-copy">
          <div className="seum-home-eyebrow">Seum</div>
          <h1 className="seum-home-title">
            구조와 접근성은 라이브러리가, 스타일과 흐름은 앱이 소유합니다.
          </h1>
          <p className="seum-home-description">
            Seum은 React 19용 headless UI 라이브러리입니다. `dialog.open()`으로 커스텀 모달을 열고,
            `dialog.confirm()`과 `dialog.alert()`으로 자주 쓰는 확인 흐름을 더 짧게 다룰 수
            있습니다.
          </p>
          <div className="seum-home-actions">
            <Link className="seum-docs-button is-primary" href="/docs/getting-started">
              시작하기
            </Link>
            <Link className="seum-docs-button is-ghost" href="/docs/components/dialog">
              Dialog 문서 보기
            </Link>
          </div>
        </div>

        <div className="seum-home-panel">
          <div className="seum-home-panel-label">Recommended split</div>
          <div className="seum-home-api-list">
            <div className="seum-home-api-item">
              <code>open()</code>
              <p>커스텀 모달, 패널, 시트처럼 구조를 직접 설계할 때</p>
            </div>
            <div className="seum-home-api-item">
              <code>confirm()</code>
              <p>확인/취소와 비동기 confirm 흐름이 필요할 때</p>
            </div>
            <div className="seum-home-api-item">
              <code>alert()</code>
              <p>단일 확인 버튼으로 공지성 모달을 띄울 때</p>
            </div>
          </div>
        </div>
      </section>

      <section className="seum-home-grid">
        <article className="seum-home-card">
          <h2>Imperative API</h2>
          <p>트리 깊이에 상관없이 어디서든 열 수 있고, provider는 앱 루트에 한 번만 두면 됩니다.</p>
        </article>
        <article className="seum-home-card">
          <h2>Headless styling</h2>
          <p>
            `data-seum-*`와 `data-state`만 노출하므로 Tailwind나 CSS Modules 위에 바로 얹을 수
            있습니다.
          </p>
        </article>
        <article className="seum-home-card">
          <h2>Exit animation</h2>
          <p>
            `open → closed` 전환 뒤 애니메이션이 끝나면 unmount되어, entry/exit를 같은 방식으로
            제어할 수 있습니다.
          </p>
        </article>
      </section>

      <section className="seum-home-demo">
        <div className="seum-home-section-head">
          <div className="seum-home-section-eyebrow">Live demo</div>
          <h2>문서 안에서 바로 open / confirm / alert 흐름을 확인할 수 있습니다</h2>
          <p>
            이 데모는 실제 public API와 같은 방식으로 구성되어 있습니다. custom modal은
            `open()`으로, 확인 흐름은 `confirm()`으로, 단일 알림은 `alert()`로 분리했습니다.
          </p>
        </div>
        <DialogDocsDemo />
      </section>
    </main>
  )
}
