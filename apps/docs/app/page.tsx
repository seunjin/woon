import Link from 'next/link'
import { Header } from '@/components/layout/Header'

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <Header />

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="max-w-[560px] text-center">
          <p className="inline-block text-xs uppercase tracking-[0.08em] text-text-muted mb-5">
            Headless UI for React
          </p>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-tight text-text-body mb-5 break-keep">
            UI의 기틀을
            <br />
            세우다
          </h1>
          <p className="text-[17px] text-text-muted leading-[1.8] mb-10 break-keep">
            UX와 접근성을 어느 정도 강제하는 React 헤드리스 UI 라이브러리.
            <br />
            기능은 완성, 스타일은 자유롭게.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/docs"
              className="inline-flex items-center h-[38px] px-4 bg-accent text-accent-fg text-sm rounded-sm transition-colors hover:bg-accent-hover"
            >
              시작하기
            </Link>
            <Link
              href="/docs/components/dialog"
              className="inline-flex items-center h-[38px] px-4 text-text-body text-sm rounded-sm border border-border transition-colors hover:bg-bg-subtle hover:border-text-label"
            >
              컴포넌트 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
