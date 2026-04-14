import '@/app/prose.css'
import { DocsPager } from '@/components/layout/DocsPager'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="w-[min(100%,var(--layout-max))] mx-auto">
        <div className="grid grid-cols-[var(--sidebar-width)_1fr] min-h-[calc(100dvh-var(--header-height))] max-xl:grid-cols-1">
          <Sidebar />
          <main className="min-w-0">
            {children}
            <div className="grid grid-cols-[1fr_var(--toc-width)] max-xl:grid-cols-[1fr]">
              <div className="w-[min(100%,var(--content-max-width))] px-(--common-container-padding-inline) pb-10 mx-auto">
                <DocsPager />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
