import { TableOfContents } from '@/components/layout/TableOfContents'

const toc = [
  { id: 'introduction', label: 'Introduction', depth: 2 as const },
  { id: 'installation', label: 'Installation', depth: 2 as const },
  { id: 'provider-setup', label: 'Provider Setup', depth: 2 as const },
]

export default function DocsPage() {
  return (
    <div className="grid grid-cols-[1fr_var(--toc-width)] max-xl:grid-cols-[1fr]">
      <article className="w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) py-10 mx-auto">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent mb-2">
            Getting Started
          </p>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-text-body max-md:text-[1.625rem]">
            Introduction
          </h1>
          <p className="text-[17px] text-text-muted leading-[1.6]">
            Seum은 UX와 접근성을 어느 정도 강제하는 React 헤드리스 UI 라이브러리입니다.
          </p>
        </div>

        {/* Sections */}
        <section className="mb-10">
          <h2
            id="introduction"
            className="text-xl font-semibold tracking-[-0.02em] mb-3 text-text-body scroll-mt-[calc(var(--header-height)+1rem)]"
          >
            Introduction
          </h2>
          <p className="text-text-muted leading-[1.7]">
            headless 컴포넌트 + 기본 CSS를 제공하며, 스타일은 완전히 오버라이드 가능합니다.
          </p>
        </section>

        <section className="mb-10">
          <h2
            id="installation"
            className="text-xl font-semibold tracking-[-0.02em] mb-3 text-text-body scroll-mt-[calc(var(--header-height)+1rem)]"
          >
            Installation
          </h2>
          <pre className="mt-3 bg-surface border border-border rounded-md px-5 py-4 font-mono text-sm overflow-x-auto text-text-body">
            <code>npm install seum</code>
          </pre>
        </section>

        <section className="mb-10">
          <h2
            id="provider-setup"
            className="text-xl font-semibold tracking-[-0.02em] mb-3 text-text-body scroll-mt-[calc(var(--header-height)+1rem)]"
          >
            Provider Setup
          </h2>
          <pre className="mt-3 bg-surface border border-border rounded-md px-5 py-4 font-mono text-sm overflow-x-auto text-text-body">
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
    </div>
  )
}
