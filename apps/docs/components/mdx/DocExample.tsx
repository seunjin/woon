import type { ReactNode } from 'react'
import { type CodeTab, CodeTabs } from './CodeTabs'

type Props = {
  title: string
  description?: string
  tabs: CodeTab[]
  children: ReactNode
}

export async function DocExample({ title, description, tabs, children }: Props) {
  return (
    <div className="doc-example-block not-prose">
      <div className="doc-example-copy">
        <h4 className="doc-example-title">{title}</h4>
        {description ? <p className="doc-example-description">{description}</p> : null}
      </div>

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
