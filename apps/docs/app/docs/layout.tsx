import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="docs-layout">
        <Sidebar />
        <main className="docs-main">{children}</main>
      </div>

      <style>{`
        .docs-layout {
          display: flex;
          padding-top: var(--header-height);
          min-height: 100vh;
        }
        .docs-main {
          flex: 1;
          min-width: 0;
          margin-left: var(--sidebar-width);
        }

        @media (max-width: 768px) {
          .docs-main {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  )
}
