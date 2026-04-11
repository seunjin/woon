'use client'

import { useDialog } from '@woon/core'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { MobileDrawer } from './MobileDrawer'

export function Header() {
  const dialog = useDialog()

  function openMobileNav() {
    dialog.open((ctx) => <MobileDrawer ctx={ctx} />, {
      closeOnOverlayClick: true,
      scrollLock: true,
    })
  }

  return (
    <header className="sticky top-0 h-(--header-height) bg-bg border-b border-border z-100">
      <div className="flex items-center justify-between h-full w-[min(100%,var(--layout-max))] mx-auto px-(--common-container-padding-inline)">
        {/* Left: 모바일 햄버거 + 로고 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openMobileNav}
            className="xl:hidden flex items-center justify-center w-9 h-9 rounded-sm text-text-label hover:bg-surface hover:text-text-heading transition-colors"
            aria-label="메뉴 열기"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center gap-2 font-semibold text-base">
            <span className="flex items-center justify-center w-7 h-7 bg-accent text-accent-fg rounded-sm text-sm font-bold">
              W
            </span>
            <span className="text-text-body tracking-tight">woon</span>
          </Link>
        </div>

        {/* Right: Desktop nav */}
        <nav className="flex items-center gap-1 max-xl:hidden">
          <Link
            href="/docs"
            className="px-3 py-1.5 text-sm text-text-label rounded-sm transition-colors hover:text-text-heading hover:bg-surface"
          >
            Docs
          </Link>
          <Link
            href="/docs/components/dialog"
            className="px-3 py-1.5 text-sm text-text-label rounded-sm transition-colors hover:text-text-heading hover:bg-surface"
          >
            Components
          </Link>
          <a
            href="https://github.com/seunjin/woon"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm text-text-label rounded-sm transition-colors hover:text-text-heading hover:bg-surface"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
