import type { ReactNode } from 'react'
import { DocsPager } from './DocsPager'
import { TableOfContents } from './TableOfContents'

type TocItem = {
  id: string
  label: string
  depth: 2 | 3
}

type Props = {
  toc: TocItem[]
  children: ReactNode
}

export function DocsPageLayout({ toc, children }: Props) {
  return (
    <div className="grid grid-cols-[1fr_var(--toc-width)] max-xl:grid-cols-[1fr]">
      <div className="min-w-0">
        {children}
        <div className="w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) pb-10 mx-auto">
          <DocsPager />
        </div>
      </div>
      <TableOfContents items={toc} />
    </div>
  )
}
