'use client'

import type { DialogContext } from '@woon/core'
import { Dialog } from '@woon/core/dialog'
import { X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navGroups } from './nav-data'

type Props = {
  ctx: DialogContext
}

export function MobileDrawer({ ctx }: Props) {
  const pathname = usePathname()

  return (
    <Dialog.Root>
      <Dialog.Overlay className="drawer-overlay" />
      <Dialog.Content className="drawer-content" aria-label="네비게이션">
        {/* Header */}
        <div className="flex items-center justify-between h-(--header-height) px-(--common-container-padding-inline) border-b border-border shrink-0">
          <Link href="/" onClick={ctx.close} className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 bg-accent text-accent-fg rounded-sm text-sm font-bold">
              W
            </span>
            <span className="text-[15px] font-semibold text-text-body tracking-tight">woon</span>
          </Link>
          <Dialog.Close className="flex items-center justify-center w-8 h-8 rounded-sm text-text-label hover:bg-surface hover:text-text-heading transition-colors">
            <X size={18} />
          </Dialog.Close>
        </div>

        {/* Nav */}
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
                      onClick={ctx.close}
                      className={`block px-2 py-1.5 text-sm rounded-sm transition-colors ${
                        pathname === item.href
                          ? 'text-text-heading bg-surface font-semibold'
                          : 'text-text-label hover:text-text-body hover:bg-bg-subtle'
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
      </Dialog.Content>
    </Dialog.Root>
  )
}
