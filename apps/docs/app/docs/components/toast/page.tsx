import { TableOfContents } from '@/components/layout/TableOfContents'
import Content, { toc } from './content.mdx'

export default function ToastPage() {
  return (
    <div className="grid grid-cols-[1fr_var(--toc-width)] max-xl:grid-cols-[1fr]">
      <article className="prose min-w-0 w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) py-10 mx-auto">
        <div className="not-prose mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent mb-2">
            Overlay
          </p>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-text-heading">
            Toast
          </h1>
          <p className="text-[1.0625rem] text-text-muted leading-[1.6]">
            자동으로 사라지는 알림 메시지. 어디서든 호출할 수 있는 명령형 API입니다.
          </p>
        </div>

        <Content />
      </article>

      <TableOfContents items={toc} />
    </div>
  )
}
