'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { navGroups } from './nav-data'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // 라우트 변경 시 닫기
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname 변경 감지가 목적
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  // 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* 토글 버튼 */}
      <div className="flex gap-1 items-center xl:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center justify-center size-6.5 rounded-sm text-text-label hover:bg-surface hover:text-text-heading transition-colors cursor-pointer"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        <span className="text-sm font-medium">MENU</span>
      </div>
      {/* 드로어 */}
      <div
        className="mobile-nav-drawer"
        data-state={isOpen ? 'open' : 'closed'}
        aria-hidden={!isOpen}
      >
        {/* Top links */}
        <div className="flex flex-col px-(--common-container-padding-inline) py-3 ">
          <Link
            href="/docs"
            className="px-2 py-1.5 text-sm text-text-label rounded-sm transition-colors hover:text-text-body hover:bg-surface/60"
          >
            Docs
          </Link>
          <Link
            href="/docs/components/dialog"
            className="px-2 py-1.5 text-sm text-text-label rounded-sm transition-colors hover:text-text-body hover:bg-surface/60"
          >
            Components
          </Link>
          <a
            href="https://github.com/seunjin/woon"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1.5 text-sm text-text-label rounded-sm transition-colors hover:text-text-body hover:bg-surface/60"
          >
            GitHub
          </a>
        </div>

        {/* Sidebar nav */}
        <nav className="flex flex-col gap-6 px-(--common-container-padding-inline) py-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-subtle px-2 mb-1">
                {group.label}
              </p>
              <ul className="flex flex-col gap-px">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-2 py-1.5 text-sm rounded-sm transition-colors ${
                        pathname === item.href
                          ? 'text-text-heading bg-surface/80 font-semibold'
                          : 'text-text-label hover:text-text-body hover:bg-surface/60'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  )
}
