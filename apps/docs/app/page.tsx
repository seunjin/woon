import Link from 'next/link'
import { Header } from '@/components/layout/Header'

const features = [
  {
    title: '명령형 API',
    description: '컴포넌트 트리 바깥 — 에러 핸들러, 비동기 함수, 어디서든 호출 가능합니다.',
    code: `const ok = await confirm('나가시겠습니까?')
toast('저장됐습니다')`,
  },
  {
    title: '행동 복잡도 해결',
    description:
      '포커스 트래핑, 오버레이 스태킹, 포지셔닝, 키보드 내비게이션을 기본값으로 처리합니다.',
    code: `// ESC 순서, z-index, ARIA
// 모두 자동으로 처리됩니다`,
  },
  {
    title: 'Opt-in 스타일',
    description:
      '기본 CSS를 제공하되 전부 덮어쓸 수 있습니다. 스타일의 주도권은 사용자에게 있습니다.',
    code: `[data-woon-dialog-content] {
  border-radius: 16px;
  background: #1e1e2e;
}`,
  },
]

const components = [
  { label: 'Dialog', href: '/docs/components/dialog', desc: '모달 · 알림 · 확인' },
  { label: 'Toast', href: '/docs/components/toast', desc: '자동 사라지는 알림' },
  { label: 'Bottom Sheet', href: '/docs/components/bottom-sheet', desc: '드래그 · 스냅 포인트' },
  { label: 'Popover', href: '/docs/components/popover', desc: '트리거 기반 팝오버' },
  { label: 'Tooltip', href: '/docs/components/tooltip', desc: '호버 · 포커스 툴팁' },
  { label: 'Select', href: '/docs/components/select', desc: '커스텀 셀렉트' },
  { label: 'Combobox', href: '/docs/components/combobox', desc: '검색 가능한 셀렉트' },
  { label: 'Dropdown Menu', href: '/docs/components/dropdown-menu', desc: '컨텍스트 메뉴' },
]

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <Header />

      {/* Hero */}
      <section className="flex items-center justify-center px-6 pt-24 pb-20">
        <div className="max-w-[600px] text-center">
          <p className="inline-block text-xs uppercase tracking-[0.08em] text-text-muted mb-5">
            Headless UI for React
          </p>
          <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] font-bold leading-[1.15] tracking-[-0.03em] text-text-heading mb-6 break-keep">
            구현하기 어려운
            <br />
            인터랙션을 해결합니다
          </h1>
          <p className="text-[17px] text-text-muted leading-[1.8] mb-10 break-keep">
            Dialog, Toast, Bottom Sheet, Popover — 접근성과 행동은 라이브러리가,
            <br className="max-sm:hidden" />
            스타일은 사용자가 결정합니다.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/docs"
              className="inline-flex items-center h-[38px] px-5 bg-accent text-accent-fg text-sm font-medium rounded-sm transition-colors hover:bg-accent-hover"
            >
              시작하기
            </Link>
            <Link
              href="/docs/components/dialog"
              className="inline-flex items-center h-[38px] px-5 text-text-body text-sm rounded-sm border border-border transition-colors hover:bg-bg-subtle hover:border-text-label"
            >
              컴포넌트 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-[1080px] mx-auto w-full">
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-bg p-6 flex flex-col gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-text-heading mb-1.5">{f.title}</p>
                <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
              </div>
              <pre className="mt-auto text-xs text-text-label bg-bg-subtle rounded-md p-3 overflow-x-auto leading-relaxed">
                <code>{f.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Components */}
      <section className="px-6 pb-24 max-w-[1080px] mx-auto w-full">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-subtle mb-4">
          Components
        </p>
        <div className="grid grid-cols-4 gap-2 max-md:grid-cols-2 max-sm:grid-cols-1">
          {components.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col gap-1 rounded-md border border-border px-4 py-3.5 transition-colors hover:bg-bg-subtle hover:border-text-label"
            >
              <span className="text-sm font-medium text-text-body group-hover:text-text-heading transition-colors">
                {c.label}
              </span>
              <span className="text-xs text-text-subtle">{c.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
