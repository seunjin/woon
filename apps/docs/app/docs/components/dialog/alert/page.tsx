import { TableOfContents } from '@/components/layout/TableOfContents'
import Content, { toc } from './content.mdx'

export default function AlertPage() {
  return (
    <div className="grid grid-cols-[1fr_var(--toc-width)] max-xl:grid-cols-[1fr]">
      <article className="prose min-w-0 w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) py-10 mx-auto">
        <div className="not-prose mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent mb-2">
            Dialog
          </p>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-text-heading">
            Alert
          </h1>
          <p className="text-[1.0625rem] text-text-muted leading-[1.6]">
            사용자 확인이 필요한 단순 알림. Promise를 반환하는 명령형 API입니다.
          </p>
        </div>

        <Content />
      </article>

      <TableOfContents items={toc} />
    </div>
  )
}
