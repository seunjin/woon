# Woon

> 행동 복잡도를 해결하는 React 19 UI primitives.

Woon은 React 19 기반의 헤드리스 UI 라이브러리입니다. 스타일은 사용자가 소유하고, 포커스 관리, 포지셔닝, 접근성, 오버레이 스태킹 같은 행동 복잡도는 Woon이 해결합니다.

## 철학

**행동 복잡도에 집중** — Dialog, Toast, Popover처럼 보기보다 구현이 어려운 상호작용을 다룹니다. 버튼, 인풋 같은 스타일 컴포넌트는 제공하지 않습니다.

**헤드리스 + opt-in CSS** — Woon은 어떤 스타일도 강제하지 않습니다. Tailwind, CSS Modules, vanilla CSS, CSS-in-JS 무엇이든 자유롭게 사용할 수 있습니다.

**접근성 우선** — WAI-ARIA 패턴을 기본으로 구현합니다. 키보드 네비게이션, 포커스 관리, 스크린 리더 지원이 자동으로 처리됩니다.

**data-* 기반 상태 노출** — 컴포넌트 상태는 `data-state`, `data-disabled` 등의 속성으로 노출됩니다. CSS 선택자만으로 모든 상태를 스타일링할 수 있습니다.

**명령형 API** — 컴포넌트 트리 바깥에서도 `alert()`, `confirm()`, `toast()` 같은 API를 호출할 수 있습니다.

**플러그인 아키텍처** — 필요한 overlay 기능만 `WoonProvider`에 등록합니다.

**애니메이션은 사용자 몫** — 진입/퇴장 애니메이션은 라이브러리가 강제하지 않습니다. `data-state`를 활용해 원하는 방식으로 구현하세요.

## 설치

```bash
npm install @woon-ui/react
```

## 빠른 시작

```tsx
import { Dialog, WoonProvider, dialogPlugin, useDialog } from '@woon-ui/react'
import '@woon-ui/react/css'

function WelcomeDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog.Overlay>
      <Dialog.Content>
        <Dialog.Title>제목</Dialog.Title>
        <Dialog.Description>설명</Dialog.Description>
        <Dialog.Close asChild>
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Overlay>
  )
}

function Page() {
  const dialog = useDialog()

  return (
    <button onClick={() => dialog.open(({ close }) => <WelcomeDialog onClose={close} />)}>
      열기
    </button>
  )
}

export function App() {
  return (
    <WoonProvider plugins={[dialogPlugin()]}>
      <Page />
    </WoonProvider>
  )
}
```

```css
/* data-state로 상태 스타일링 */
[data-woon-dialog-overlay] {
  background: rgba(0, 0, 0, 0.4);
}

[data-woon-dialog-content][data-state='open'] {
  animation: fadeIn 0.2s ease;
}

[data-woon-dialog-content][data-state='closed'] {
  animation: fadeOut 0.15s ease;
}
```

```tsx
import { confirm } from '@woon-ui/react'

const result = await confirm({
  title: '문서를 삭제할까요?',
  description: '이 작업은 되돌릴 수 없습니다.',
  confirmLabel: '삭제',
  cancelLabel: '취소',
  tone: 'danger',
})

if (result.status !== 'confirmed') return
```

## 컴포넌트

### Overlay 계열

| 컴포넌트 | 설명 |
|----------|------|
| `WoonProvider` | overlay 플러그인 렌더 진입점 |
| `Dialog` | 모달 다이얼로그 primitive |
| `alert()` | 단일 확인 버튼 preset |
| `confirm()` | 확인/취소 및 async flow preset |
| `Drawer` | Dialog 엔진 위의 edge-attached surface |
| `Toast` | 짧고 일시적인 피드백 알림 |

### Floating 계열

| 컴포넌트 | 설명 |
|----------|------|
| `Popover` | 트리거 기반 팝오버 |
| `Tooltip` | 호버/포커스 툴팁 |
| `Dropdown Menu` | 트리거 기반 드롭다운 메뉴 |
| `Context Menu` | 우클릭 컨텍스트 메뉴 |
| `Select` | 키보드/접근성 커스텀 셀렉트 |
| `Combobox` | 검색 가능한 셀렉트 |

## 요구사항

- React 19+
- TypeScript 5.0+ (권장)

## 라이선스

MIT
