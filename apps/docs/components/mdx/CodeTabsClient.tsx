'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/CopyButton'

type RenderedTab = {
  label: string
  code: string
  html: string
}

type Props = {
  tabs: RenderedTab[]
  variant?: 'default' | 'embedded'
  collapsible?: boolean
  defaultExpanded?: boolean
}

export function CodeTabsClient({
  tabs,
  variant = 'default',
  collapsible = false,
  defaultExpanded = true,
}: Props) {
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(defaultExpanded)
  const current = tabs[active]
  const isCollapsed = collapsible && !expanded

  return (
    <div
      className={`code-tabs${variant === 'embedded' ? ' code-tabs--embedded' : ''}${isCollapsed ? ' code-tabs--collapsed' : ''}`}
    >
      <div className="code-tabs-list" role="tablist" aria-hidden={isCollapsed}>
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`code-tab${active === i ? ' code-tab--active' : ''}`}
            onClick={() => setActive(i)}
            tabIndex={isCollapsed ? -1 : 0}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="code-tabs-panel">
        <CopyButton code={current.code} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: shiki 출력은 신뢰할 수 있는 HTML */}
        <div dangerouslySetInnerHTML={{ __html: current.html }} />
        {collapsible ? (
          <div className="code-tabs-footer">
            <button
              type="button"
              className="code-tabs-toggle"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded ? 'Hide code' : 'View code'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
