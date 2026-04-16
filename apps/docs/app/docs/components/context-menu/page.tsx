import { DocsPageLayout } from '@/components/layout/DocsPageLayout'
import Content, { toc } from './content.mdx'

export default function ContextMenuPage() {
  return (
    <DocsPageLayout toc={toc}>
      <article className="prose min-w-0 w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) py-10 mx-auto">
        <div className="not-prose mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent mb-2">
            Overlay
          </p>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-text-heading">
            ContextMenu
          </h1>
          <p className="text-[1.0625rem] text-text-muted leading-[1.6]">
            우클릭으로 커서 위치에 열리는 컨텍스트 메뉴. 화살표키 내비게이션, typeahead, ARIA menu
            패턴을 지원합니다.
          </p>
        </div>

        <Content />
      </article>
    </DocsPageLayout>
  )
}
