import { DocsPageLayout } from '@/components/layout/DocsPageLayout'
import Content, { toc } from './content.mdx'

export default function AdaptiveSelectPage() {
  return (
    <DocsPageLayout toc={toc}>
      <article className="prose min-w-0 w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) py-10 mx-auto">
        <div className="not-prose mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent mb-2">
            Patterns
          </p>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-text-heading">
            Adaptive Select
          </h1>
          <p className="text-[1.0625rem] text-text-muted leading-[1.6]">
            환경에 따라 Popover 드롭다운과 Bottom Sheet를 자동으로 전환하는 Select 패턴.
          </p>
        </div>

        <Content />
      </article>
    </DocsPageLayout>
  )
}
