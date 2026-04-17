import Link from 'next/link'
import { Header } from '@/components/layout/Header'

const features = [
  {
    title: '명령형 API',
    description:
      '컴포넌트 트리 밖 어디서든 호출할 수 있습니다. 비동기 흐름, 에러 핸들러, 유틸리티 함수 안에서도 자연스럽게 동작합니다.',
    code: `// API 요청 실패 시
const result = await confirm('다시 시도하시겠습니까?')

// 저장 완료 후
toast('변경사항이 저장됐습니다')`,
  },
  {
    title: 'Compound 컴포넌트',
    description:
      '필요한 부분만 골라서 조합합니다. 트리거, 콘텐츠, 핸들 — 각 역할이 분리되어 있어 원하는 구조로 자유롭게 구성할 수 있습니다.',
    code: `<BottomSheet.Root>
  <BottomSheet.Trigger asChild>
    <button>열기</button>
  </BottomSheet.Trigger>
  <BottomSheet.Content>
    <BottomSheet.Handle />
  </BottomSheet.Content>
</BottomSheet.Root>`,
  },
  {
    title: 'Opt-in 스타일',
    description:
      '기본 CSS를 제공하되 언제든 덮어쓸 수 있습니다. data 속성 선택자로 특정 값만 바꾸거나, CSS 소스를 복사해 처음부터 스타일링하세요.',
    code: `/* 특정 값만 override */
[data-woon-bottom-sheet-content] {
  border-radius: 20px 20px 0 0;
  background: #0f0f0f;
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
            완성된 동작,
            <br />
            자유로운 스타일
          </h1>
          <p className="text-[17px] text-text-muted leading-[1.8] mb-10 break-keep">
            포커스, 키보드, 접근성, 포지셔닝 — 구현하기 까다로운 인터랙션 동작은 라이브러리가
            처리합니다.
            <br className="max-sm:hidden" />
            스타일은 온전히 사용자의 몫입니다.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/docs"
              className="inline-flex items-center h-[38px] px-5 bg-accent text-accent-fg text-sm font-medium rounded-sm transition-colors hover:bg-accent-hover"
            >
              시작하기
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
