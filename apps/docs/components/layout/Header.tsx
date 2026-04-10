import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0  h-(--header-height) bg-bg border-b border-border z-100">
      <div className="flex items-center justify-between h-full w-[min(100%,var(--layout-max))] mx-auto px-(--common-container-padding-inline)">
        <Link href="/" className="flex items-center gap-2 font-semibold text-base">
          <span className="flex items-center justify-center w-7 h-7 bg-accent text-white rounded-sm text-sm font-bold">
            S
          </span>
          <span className="text-text-body tracking-tight">seum</span>
        </Link>

        <nav className="flex items-center gap-1 max-sm:hidden">
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
            href="https://github.com/seunjin/seum"
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
