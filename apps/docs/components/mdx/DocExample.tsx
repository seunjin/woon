import './DocExample.css'
import type { ReactNode } from 'react'
import { type CodeTab, CodeTabs } from './CodeTabs'

type Props = {
  tabs: CodeTab[]
  children: ReactNode
}

export async function DocExample({ tabs, children }: Props) {
  return (
    <div className="doc-example-block not-prose">
      <section className="doc-example">
        <div className="doc-example-preview">
          <div className="doc-example-preview-body">{children}</div>
        </div>

        <div className="doc-example-code">
          <CodeTabs tabs={tabs} variant="embedded" collapsible defaultExpanded={false} />
        </div>
      </section>
    </div>
  )
}
