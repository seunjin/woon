import { TableOfContents } from '@/components/layout/TableOfContents'

const toc = [
  { id: 'introduction', label: 'Introduction', depth: 2 as const },
  { id: 'installation', label: 'Installation', depth: 2 as const },
  { id: 'provider-setup', label: 'Provider Setup', depth: 2 as const },
]

export default function DocsPage() {
  return (
    <div className="page-layout">
      <article className="page-content">
        <div className="page-header">
          <p className="page-eyebrow">Getting Started</p>
          <h1 className="page-title">Introduction</h1>
          <p className="page-lead">
            Seum은 UX와 접근성을 어느 정도 강제하는 React 헤드리스 UI 라이브러리입니다.
          </p>
        </div>

        <section className="page-section">
          <h2 id="introduction">Introduction</h2>
          <p>headless 컴포넌트 + 기본 CSS를 제공하며, 스타일은 완전히 오버라이드 가능합니다.</p>
        </section>

        <section className="page-section">
          <h2 id="installation">Installation</h2>
          <pre className="code-block">
            <code>npm install seum</code>
          </pre>
        </section>

        <section className="page-section">
          <h2 id="provider-setup">Provider Setup</h2>
          <pre className="code-block">
            <code>{`import { SeumProvider } from 'seum'
import { dialogPlugin } from 'seum/dialog'
import { toastPlugin } from 'seum/toast'

export default function App() {
  return (
    <SeumProvider
      plugins={[
        dialogPlugin(),
        toastPlugin({ position: 'bottom-right' }),
      ]}
    >
      <YourApp />
    </SeumProvider>
  )
}`}</code>
          </pre>
        </section>
      </article>

      <TableOfContents items={toc} />

      <style>{`
        .page-layout {
          display: flex;
          gap: 2rem;
        }
        .page-content {
          flex: 1;
          min-width: 0;
          max-width: var(--content-max-width);
          padding: 2.5rem 2rem;
        }
        .page-header {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
        }
        .page-eyebrow {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-accent);
          margin-bottom: 0.5rem;
        }
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 0.75rem;
          color: var(--color-text);
        }
        .page-lead {
          font-size: 1.0625rem;
          color: var(--color-text-muted);
          line-height: 1.6;
        }
        .page-section {
          margin-bottom: 2.5rem;
        }
        .page-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
          color: var(--color-text);
          scroll-margin-top: calc(var(--header-height) + 1rem);
        }
        .page-section p {
          color: var(--color-text-muted);
          line-height: 1.7;
        }
        .code-block {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          font-family: var(--font-geist-mono), monospace;
          font-size: 0.875rem;
          overflow-x: auto;
          margin-top: 0.75rem;
          color: var(--color-text);
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 1.5rem 1rem;
          }
          .page-title {
            font-size: 1.625rem;
          }
        }
      `}</style>
    </div>
  )
}
