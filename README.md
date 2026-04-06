# Seum (세움)

> UI의 기틀을 세우다.

Seum은 React 19 기반의 헤드리스 UI 라이브러리입니다. 스타일은 당신이 소유하고, 구조와 접근성은 Seum이 책임집니다.

## 철학

**헤드리스** — Seum은 어떤 스타일도 강제하지 않습니다. Tailwind, CSS Modules, vanilla CSS, CSS-in-JS 무엇이든 자유롭게 사용할 수 있습니다.

**접근성 우선** — WAI-ARIA 패턴을 기본으로 구현합니다. 키보드 네비게이션, 포커스 관리, 스크린 리더 지원이 자동으로 처리됩니다.

**data-* 기반 상태 노출** — 컴포넌트 상태는 `data-state`, `data-disabled` 등의 속성으로 노출됩니다. CSS 선택자만으로 모든 상태를 스타일링할 수 있습니다.

**asChild 패턴** — `asChild` prop을 통해 Seum의 동작을 원하는 HTML 요소나 커스텀 컴포넌트에 위임할 수 있습니다.

**애니메이션은 사용자 몫** — 진입/퇴장 애니메이션은 라이브러리가 강제하지 않습니다. `data-state`를 활용해 원하는 방식으로 구현하세요.

## 설치

```bash
npm install seum
```

## 빠른 시작

```tsx
import { SeumProvider } from 'seum'
import { Dialog, useDialog } from 'seum/dialog'
import 'seum/css'

function WelcomeDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog.Overlay>
      <Dialog.Content>
        <Dialog.Title>제목</Dialog.Title>
        <Dialog.Description>설명</Dialog.Description>
        <Dialog.Close asChild>
          <button onClick={onClose}>닫기</button>
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

function App() {
  return (
    <SeumProvider>
      <Page />
    </SeumProvider>
  )
}
```

```css
/* data-state로 상태 스타일링 */
[data-seum-dialog-overlay] {
  background: rgba(0, 0, 0, 0.4);
}

[data-seum-dialog-content][data-state='open'] {
  animation: fadeIn 0.2s ease;
}

[data-seum-dialog-content][data-state='closed'] {
  animation: fadeOut 0.15s ease;
}
```

```tsx
const result = await dialog.confirm({
  title: '문서를 삭제할까요?',
  description: '이 작업은 되돌릴 수 없습니다.',
  confirmLabel: '삭제',
  cancelLabel: '취소',
  tone: 'danger',
  onConfirm: () => deletePost(),
})

if (result.status !== 'confirmed') return
```

## 컴포넌트

### Overlay 계열

| 컴포넌트 | 설명 |
|----------|------|
| `Dialog` | 모달 다이얼로그 |
| `Popover` | 트리거 기준 부유 콘텐츠 |
| `Tooltip` | 호버 툴팁 |
| `Toast` | 알림 메시지 |
| `Drawer` | 사이드 패널 |

### Imperative APIs

| API | 설명 |
|-----|------|
| `dialog.open()` | 커스텀 모달을 여는 low-level primitive |
| `dialog.confirm()` | 확인/취소와 비동기 confirm 흐름을 위한 preset |
| `dialog.alert()` | 단일 확인 버튼이 필요한 알림성 모달 |

### Form 계열

| 컴포넌트 | 설명 |
|----------|------|
| `Field` | Input, Label, Error를 묶는 필드 컨테이너 |
| `Input` | 텍스트 입력 |
| `Textarea` | 멀티라인 입력 |
| `Select` | 드롭다운 선택 |
| `Combobox` | 검색 가능한 선택 |
| `Checkbox` | 체크박스 |
| `Radio` | 라디오 버튼 그룹 |
| `Switch` | 토글 스위치 |

### Navigation 계열

| 컴포넌트 | 설명 |
|----------|------|
| `Tabs` | 탭 네비게이션 |
| `Accordion` | 아코디언 |
| `Collapsible` | 단일 접기/펼치기 |

## 요구사항

- React 19+
- TypeScript 5.0+ (권장)

## 라이선스

MIT
