import { TableOfContents } from '@/components/layout/TableOfContents'
import Content, { toc } from './content.mdx'

export default function DocsPage() {
  return (
    <div className="grid grid-cols-[1fr_var(--toc-width)] max-xl:grid-cols-[1fr]">
      <article className="prose min-w-0 w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) py-10 mx-auto">
        <div className="not-prose mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent mb-2">
            Getting Started
          </p>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-text-heading">
            Introduction
          </h1>
          <p className="text-[1.0625rem] text-text-muted leading-[1.6]">
            구현하기 어려운 인터랙션 행동을 해결하는 React UI 라이브러리. 스타일은 사용자의
            자유입니다.
          </p>
        </div>

        <Content />
      </article>

      <TableOfContents items={toc} />
    </div>
  )
}
