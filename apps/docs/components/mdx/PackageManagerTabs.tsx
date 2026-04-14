'use client'

import { useState } from 'react'

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

const commands: Record<PackageManager, string> = {
  npm: 'npm install @woon/core',
  pnpm: 'pnpm add @woon/core',
  yarn: 'yarn add @woon/core',
  bun: 'bun add @woon/core',
}

const tabs: { id: PackageManager; label: string }[] = [
  { id: 'npm', label: 'npm' },
  { id: 'pnpm', label: 'pnpm' },
  { id: 'yarn', label: 'yarn' },
  { id: 'bun', label: 'bun' },
]

export function PackageManagerTabs() {
  const [active, setActive] = useState<PackageManager>('npm')

  return (
    <div className="pkg-tabs">
      <div className="pkg-tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`pkg-tab ${active === tab.id ? 'pkg-tab--active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pkg-tabs-panel">
        <pre className="pkg-tabs-pre">
          <code>{commands[active]}</code>
        </pre>
      </div>
    </div>
  )
}
