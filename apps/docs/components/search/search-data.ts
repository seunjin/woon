export type SearchEntry = {
  title: string
  href: string
  group: string
  description: string
  keywords: string[]
}

export const searchEntries: SearchEntry[] = [
  // Getting Started
  {
    title: 'Introduction',
    href: '/docs',
    group: 'Getting Started',
    description: 'woon 소개 및 핵심 특징',
    keywords: ['시작', '소개', 'headless', 'behavioral'],
  },
  {
    title: 'Installation',
    href: '/docs/installation',
    group: 'Getting Started',
    description: '설치 및 CSS 설정',
    keywords: ['설치', 'install', 'npm', 'pnpm', 'css'],
  },
  // Overlay
  {
    title: 'Provider',
    href: '/docs/provider',
    group: 'Overlay',
    description: 'WoonProvider 설정',
    keywords: ['provider', 'plugin', 'setup'],
  },
  {
    title: 'Dialog',
    href: '/docs/components/dialog',
    group: 'Overlay',
    description: '모달, 알림, 확인 다이얼로그',
    keywords: ['modal', '모달', 'alert', 'confirm', '다이얼로그'],
  },
  {
    title: 'Alert',
    href: '/docs/components/dialog/alert',
    group: 'Overlay',
    description: '알림 다이얼로그',
    keywords: ['alert', '알림', 'dialog'],
  },
  {
    title: 'Confirm',
    href: '/docs/components/dialog/confirm',
    group: 'Overlay',
    description: '확인 다이얼로그',
    keywords: ['confirm', '확인', 'dialog'],
  },
  {
    title: 'Drawer',
    href: '/docs/components/drawer',
    group: 'Overlay',
    description: 'Dialog 시스템 위의 edge-attached surface',
    keywords: ['drawer', '드로어', 'side panel', 'panel', 'bottom drawer', 'overlay', 'dialog'],
  },
  {
    title: 'Toast',
    href: '/docs/components/toast',
    group: 'Overlay',
    description: '짧고 일시적인 피드백 알림',
    keywords: ['toast', '알림', 'notification', 'snackbar'],
  },
  // Floating
  {
    title: 'Tooltip',
    href: '/docs/components/tooltip',
    group: 'Floating',
    description: '호버/포커스/탭 시 툴팁',
    keywords: ['tooltip', '툴팁', 'hover'],
  },
  {
    title: 'Popover',
    href: '/docs/components/popover',
    group: 'Floating',
    description: '트리거 기반 팝오버',
    keywords: ['popover', '팝오버', 'floating'],
  },
  {
    title: 'Dropdown Menu',
    href: '/docs/components/dropdown-menu',
    group: 'Floating',
    description: '트리거 기반 드롭다운 메뉴',
    keywords: ['dropdown', '드롭다운', 'menu', '메뉴'],
  },
  {
    title: 'Context Menu',
    href: '/docs/components/context-menu',
    group: 'Floating',
    description: '우클릭 컨텍스트 메뉴',
    keywords: ['context', '컨텍스트', 'rightclick', '우클릭', 'menu'],
  },
  {
    title: 'Select',
    href: '/docs/components/select',
    group: 'Floating',
    description: '키보드 · 접근성 커스텀 셀렉트',
    keywords: ['select', '셀렉트', 'dropdown', 'option'],
  },
  {
    title: 'Combobox',
    href: '/docs/components/combobox',
    group: 'Floating',
    description: '검색 가능한 셀렉트',
    keywords: ['combobox', '콤보박스', 'autocomplete', '자동완성', 'search'],
  },
  // Patterns
  {
    title: 'Adaptive Select',
    href: '/docs/patterns/adaptive-select',
    group: 'Patterns',
    description: 'Popover ↔ Drawer 자동 전환',
    keywords: ['adaptive', 'responsive', 'mobile', 'select', 'drawer', '반응형'],
  },
]
