import { DocsPageLayout } from '@/components/layout/DocsPageLayout'
import Content, { toc } from './content.mdx'

export default function DrawerPage() {
  return (
    <DocsPageLayout toc={toc}>
      <article className="prose min-w-0 w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) py-10 mx-auto">
        <div className="not-prose mb-10 pb-8 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-accent mb-2">
            Overlay
          </p>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-text-heading">
            Drawer
          </h1>
          <p className="text-[1.0625rem] text-text-muted leading-[1.6]">
            dialog 시스템 위에서 동작하는 edge-attached surface. 좌우 패널과 모바일 바텀 드로어를
            같은 API로 구성합니다.
          </p>
        </div>

        <Content />
      </article>
    </DocsPageLayout>
  )
}
