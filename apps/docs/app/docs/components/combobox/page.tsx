import { DocsPageLayout } from '@/components/layout/DocsPageLayout'
import Content, { toc } from './content.mdx'

export default function ComboboxPage() {
  return (
    <DocsPageLayout toc={toc}>
      <article className="prose min-w-0 w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) py-10 mx-auto">
        <div className="not-prose mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent mb-2">
            Floating
          </p>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-text-heading">
            Combobox
          </h1>
          <p className="text-[1.0625rem] text-text-muted leading-[1.6]">
            입력 필드와 선택 목록이 결합된 컴포넌트. 키보드 내비게이션·필터링·freeForm 입력을
            지원합니다.
          </p>
        </div>

        <Content />
      </article>
    </DocsPageLayout>
  )
}
