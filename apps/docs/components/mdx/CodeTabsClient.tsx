'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/CopyButton'

type RenderedTab = {
  label: string
  code: string
  html: string
}

export function CodeTabsClient({ tabs }: { tabs: RenderedTab[] }) {
  const [active, setActive] = useState(0)
  const current = tabs[active]

  return (
    <div className="code-tabs">
      <div className="code-tabs-list" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`code-tab${active === i ? ' code-tab--active' : ''}`}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="code-tabs-panel">
        <CopyButton code={current.code} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: shiki 출력은 신뢰할 수 있는 HTML */}
        <div dangerouslySetInnerHTML={{ __html: current.html }} />
      </div>
    </div>
  )
}
