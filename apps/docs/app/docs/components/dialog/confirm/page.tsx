import { DocsPageLayout } from '@/components/layout/DocsPageLayout'
import Content, { toc } from './content.mdx'

export default function ConfirmPage() {
  return (
    <DocsPageLayout toc={toc}>
      <article className="prose min-w-0 w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) py-10 mx-auto">
        <div className="not-prose mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent mb-2">
            Dialog
          </p>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-text-heading">
            Confirm
          </h1>
          <p className="text-[1.0625rem] text-text-muted leading-[1.6]">
            확인/취소 선택과 비동기 처리 플로우를 지원하는 명령형 API입니다.
          </p>
        </div>

        <Content />
      </article>
    </DocsPageLayout>
  )
}
