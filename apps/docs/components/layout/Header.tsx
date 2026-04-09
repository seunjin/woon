import Link from 'next/link'

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-logo">
          <span className="header-logo-mark">S</span>
          <span className="header-logo-name">seum</span>
        </Link>
        <nav className="header-nav">
          <Link href="/docs" className="header-nav-link">
            Docs
          </Link>
          <Link href="/docs/components/dialog" className="header-nav-link">
            Components
          </Link>
          <a
            href="https://github.com/seunjin/seum"
            target="_blank"
            rel="noopener noreferrer"
            className="header-nav-link"
          >
            GitHub
          </a>
        </nav>
      </div>

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--header-height);
          background: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
          z-index: 100;
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
        }
        .header-logo-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--color-accent);
          color: #fff;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 700;
        }
        .header-logo-name {
          color: var(--color-text);
          letter-spacing: -0.01em;
        }
        .header-nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .header-nav-link {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          color: var(--color-text-label);
          border-radius: var(--radius-sm);
          transition: color 0.15s, background 0.15s;
        }
        .header-nav-link:hover {
          color: var(--color-text-heading);
          background: var(--color-surface);
        }

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }
        }
      `}</style>
    </header>
  )
}
