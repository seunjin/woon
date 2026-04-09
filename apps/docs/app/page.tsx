import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="home">
      <div className="home-nav">
        <div className="home-logo">
          <span className="home-logo-mark">S</span>
          <span className="home-logo-text">seum</span>
        </div>
        <div className="home-nav-links">
          <Link href="/docs">Docs</Link>
          <Link href="/docs/components/dialog">Components</Link>
          <a href="https://github.com/seunjin/seum" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>

      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">Headless UI for React</p>
          <h1 className="hero-title">
            UI의 기틀을
            <br />
            세우다
          </h1>
          <p className="hero-description">
            UX와 접근성을 어느 정도 강제하는 React 헤드리스 UI 라이브러리. 기능은 완성, 스타일은
            자유롭게.
          </p>
          <div className="hero-actions">
            <Link href="/docs" className="btn-primary">
              시작하기
            </Link>
            <Link href="/docs/components/dialog" className="btn-secondary">
              컴포넌트 보기
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .home {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--color-bg);
        }
        .home-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 56px;
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          background: var(--color-bg);
          z-index: 100;
        }
        .home-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .home-logo-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: var(--color-accent);
          color: white;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .home-logo-text {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-text);
          letter-spacing: -0.02em;
        }
        .home-nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .home-nav-links a {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          transition: color 0.15s;
        }
        .home-nav-links a:hover {
          color: var(--color-text);
        }
        .hero {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem;
        }
        .hero-inner {
          max-width: 560px;
          text-align: center;
        }
        .hero-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          margin-bottom: 1.25rem;
        }
        .hero-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          line-height: 1.25;
          color: var(--color-text);
          margin-bottom: 1.25rem;
          word-break: keep-all;
        }
        .hero-description {
          font-size: 1.0625rem;
          color: var(--color-text-muted);
          line-height: 1.8;
          margin-bottom: 2.5rem;
          word-break: keep-all;
        }
        .hero-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          height: 38px;
          padding: 0 1rem;
          background: var(--color-accent);
          color: #ffffff;
          font-size: 1rem;
          font-weight: 400;
          border-radius: var(--radius-sm);
          transition: background 0.15s;
        }
        .btn-primary:hover {
          background: var(--color-accent-hover);
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          height: 38px;
          padding: 0 1rem;
          background: transparent;
          color: var(--color-text);
          font-size: 1rem;
          font-weight: 400;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          transition: background 0.15s, border-color 0.15s;
        }
        .btn-secondary:hover {
          background: var(--color-bg-subtle);
          border-color: var(--color-text-label);
        }
      `}</style>
    </main>
  )
}
