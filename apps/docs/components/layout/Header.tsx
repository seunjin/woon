'use client'

import Link from 'next/link'
import { SearchTrigger } from '../search/SearchTrigger'
import { MobileNav } from './MobileNav'

export function Header() {
  return (
    <header className="sticky top-0 h-(--header-height) bg-bg z-100">
      <div className="flex items-center justify-between h-full w-[min(100%,var(--layout-max))] mx-auto px-(--common-container-padding-inline)">
        {/* 모바일: 햄버거/X 버튼만 */}
        <MobileNav />

        {/* 데스크탑: 로고 */}
        <Link href="/" className="max-xl:hidden flex items-center gap-2 font-semibold text-base">
          <span className="flex items-center justify-center w-7 h-7 bg-accent text-accent-fg rounded-sm text-sm font-bold">
            W
          </span>
          <span className="text-text-body tracking-tight">woon</span>
        </Link>

        {/* 데스크탑: nav */}
        <nav className="flex items-center gap-1 max-xl:hidden">
          <SearchTrigger />
          <Link
            href="/docs"
            className="px-3 py-1.5 text-sm text-text-label rounded-sm transition-colors hover:text-text-heading hover:bg-surface"
          >
            Docs
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
