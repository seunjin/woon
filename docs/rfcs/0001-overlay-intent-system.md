# RFC 0001: Woon 오버레이 의도 관리 시스템

- 상태: 제안
- 작성일: 2026-07-14
- 담당: Woon 유지보수 팀

## 요약

Woon vNext는 React UI 프리미티브 라이브러리에서 **Base UI 기반 로컬 오버레이를 중앙 관리하는 의도 중심 시스템**으로 전환한다.

Woon은 Dialog, AlertDialog, Drawer의 접근성 또는 DOM 동작을 다시 구현하지 않는다. 먼저 앱이 소유한 Base UI AlertDialog를 `overlay.alert()`, `overlay.confirm()` 같은 의미 단위 API에 연결하고, 호출·정책·결과를 일관되게 관리한다. 이후 Dialog, Drawer, 풀페이지 모달 같은 커스텀 오버레이를 등록형 API로 확장한다.

> Base UI는 동작의 기반을 제공하고, Woon은 제품에서 사용할 의미와 규칙을 관리한다.

## 해결하려는 문제

Base UI의 `Dialog`, `AlertDialog`, `Drawer`는 유연한 프리미티브다. 이 유연성 때문에 제품 코드에서 다음과 같은 혼재가 쉽게 생긴다.

- 단순 안내를 `Dialog`로 구현한다.
- 파괴적인 작업 확인을 일반 `Dialog`로 구현한다.
- 입력 폼을 `AlertDialog` 안에 구현한다.
- 같은 확인창이 여러 화면에서 서로 다른 닫기 규칙과 문구로 동작한다.
- 요청 중복, 오버레이 우선순위, Promise 결과, 라우트 전환 같은 앱 수준 규칙을 각 호출부가 직접 처리한다.

기존 Woon은 포커스 가두기, 스크롤 잠금, ESC 처리 순서, 포털, z-index 등 프리미티브 동작을 직접 구현한다. 이 영역은 Base UI가 더 적절하게 책임지는 영역이며, Woon의 차별점이 아니다.

## 목표

- 앱에서 `alert`와 `confirm`의 사용자 의도를 명확하게 구분한다.
- 앱 로컬의 Base UI 컴포넌트를 수정 없이 계속 소유할 수 있게 한다.
- 호출부가 Base UI 프리미티브를 직접 조립하지 않아도 되게 한다.
- Promise 결과, 대기열, 중복 방지, 닫기 정책, 생명주기 이벤트를 중앙에서 관리한다.
- CLI가 즉시 동작하는 로컬 오버레이 파일을 생성한다.
- 완전히 커스텀한 오버레이도 작고 타입이 명확한 연결 계약으로 등록할 수 있게 한다.

## MVP 범위

첫 번째 릴리스에서는 `alert`와 `confirm`만 구현하고 검증한다.

- `overlay.alert()`: 내용을 인지하고 닫는 단일 확인 흐름
- `overlay.confirm()`: 취소하거나 계속 진행하는 양자 선택 흐름
- 비동기 `onConfirm`: 선택적으로 제공하며 Woon이 대기·실패 상태를 관리
- 로컬 `alert.tsx`, `confirm.tsx`: Base UI AlertDialog를 사용해 사용자가 직접 소유

`dialog`, `drawer`, 풀페이지 모달, 특수한 형태의 오버레이는 타입 구조만 고려하되 MVP 공개 API에는 포함하지 않는다.

## 하지 않는 것

- Base UI의 포커스 관리, 포털, 제스처, 스크롤 잠금, 키보드 탐색을 재구현하지 않는다.
- CSS 디자인 시스템 또는 기본 브랜드 스타일을 제공하지 않는다.
- 모든 앱의 Dialog 사용을 강제로 Woon으로 옮기지 않는다.
- 로컬 컴포넌트의 내부 구조를 자동으로 탐색하거나 추론하지 않는다.
- Base UI API 전체를 이름만 바꾼 래퍼로 만들지 않는다.

## 사용자 의도 분류

| Woon API | 사용자에게 요구하는 일 | 내부 Base UI | 반환 결과 |
| --- | --- | --- | --- |
| `alert` | 내용을 인지하고 닫기 | `AlertDialog` | `Promise<void>` |
| `confirm` | 취소 또는 진행 결정 | `AlertDialog` | `Promise<boolean>` |

`AlertDialog`는 Woon 사용자에게 직접 노출하는 공개 개념이 아니다. `alert`와 `confirm`을 구현하는 내부 기반이다.

### 의도별 제약

- `alert`는 한 개의 확인 동작만 제공한다. 취소 동작, 입력 폼, 위험 강조 표현은 허용하지 않는다.
- `confirm`은 항상 확인 또는 취소 결과를 돌려준다. `danger` 톤일 때는 `confirmLabel`을 필수로 요구한다.

## 구조

```text
애플리케이션 호출부
  └─ useOverlay().confirm(...)
       ↓
@woon-ui/core
  ├─ 요청 생명주기와 Promise 결과 처리
  ├─ 대기열, 중복, 쌓임 정책
  ├─ 생명주기 이벤트와 분석 연결점
  └─ 렌더러 등록부
       ↓
앱이 소유한 로컬 오버레이 렌더러
  └─ components/woon/confirm.tsx
       ↓
@base-ui/react
  └─ AlertDialog / Dialog / Drawer
```

### 소유권

| 계층 | 소유자 | 책임 |
| --- | --- | --- |
| Base UI | Base UI | 접근성, 포커스, 포털, 포인터·키보드 동작, 제스처 |
| Woon 코어 | Woon | 요청, 결과, 정책, 쌓임 순서, 등록, 생명주기 |
| 오버레이 렌더러 | 애플리케이션 | JSX, CSS, 브랜드, 문구 배치, 앱 전용 Base UI 속성 |

## 패키지 구성

```text
@woon-ui/core
  Base UI에 의존하지 않는 실행 환경과 TypeScript 연결 계약

@woon-ui/base-ui
  선택적으로 사용하는 Base UI 연결 도우미
  동료 의존성: @base-ui/react

@woon-ui/cli
  앱 로컬 오버레이 파일을 생성하고 템플릿과 비교
```

`@base-ui/react`는 `@woon-ui/base-ui`의 동료 의존성으로 둔다. Woon이 Base UI를 몰래 중복 설치하지 않으며, 애플리케이션이 Base UI 버전을 관리한다.

## 공개 API 제안

```tsx
import { useOverlay } from '@woon-ui/core'

function DeleteProjectButton({ projectId }: { projectId: string }) {
  const overlay = useOverlay()

  async function handleDelete() {
    const confirmed = await overlay.confirm({
      title: '프로젝트를 삭제할까요?',
      description: '삭제한 프로젝트는 복구할 수 없습니다.',
      confirmLabel: '삭제',
      cancelLabel: '돌아가기',
      tone: 'danger',
    })

    if (!confirmed) return
    await deleteProject(projectId)
  }

  return <button onClick={handleDelete}>삭제</button>
}
```

```ts
export type AlertRequest = {
  title: React.ReactNode
  description?: React.ReactNode
  acknowledgeLabel?: React.ReactNode
  dedupeKey?: string
}

export type ConfirmRequest = {
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel: React.ReactNode
  cancelLabel?: React.ReactNode
  tone?: 'neutral' | 'danger'
  dismiss?: 'allow' | 'block'
  dedupeKey?: string
  onConfirm?: () => void | Promise<void>
}

export type OverlayApi = {
  alert(request: AlertRequest): Promise<void>
  confirm(request: ConfirmRequest): Promise<boolean>
  dismissAll(reason?: 'route-change' | 'programmatic'): void
}
```

`overlay.*`는 호출부에서는 명령형으로 사용하고, 화면은 선언적으로 렌더링한다. `WoonProvider`가 요청 상태를 보관하고 등록된 오버레이를 상태에 맞게 렌더링한다.

### 비동기 `onConfirm`

`onConfirm`은 선택 기능으로 제공한다.

```tsx
await overlay.confirm({
  title: '프로젝트를 삭제할까요?',
  description: '삭제한 프로젝트는 복구할 수 없습니다.',
  confirmLabel: '삭제',
  tone: 'danger',
  onConfirm: () => deleteProject(projectId),
})
```

`onConfirm`을 전달하면 Woon은 다음 상태 전이만 관리한다.

```text
open → pending → confirmed → closing
               ↘ error → pending (재시도)
```

- Promise 실행 중에는 상태를 `pending`으로 바꾸고 중복 확인과 닫기를 막는다.
- Promise가 완료되면 확인 결과를 확정하고 오버레이를 닫는다.
- Promise가 실패하면 오버레이를 유지하고 `error`를 렌더러에 전달한다.
- 실패 후 사용자가 확인 버튼을 다시 누르면 같은 `onConfirm`을 재실행한다.
- `pending` 중에는 바깥 영역 클릭, ESC, 취소 버튼을 통한 닫기를 모두 차단한다.
- 스피너, 버튼 비활성화, 오류 문구의 위치와 디자인은 Woon이 렌더링하지 않는다.
- `onConfirm`이 없으면 기존처럼 확인 즉시 `true`를 반환한다. 호출부가 후속 작업을 직접 실행할 수 있다.

이 구조는 편리한 비동기 처리를 제공하면서 특정 Button 컴포넌트와의 결합을 피한다.

## 렌더러 연결 계약

Woon은 로컬 컴포넌트의 내부 구현을 검사하지 않는다. 렌더러는 Woon의 상태와 동작을 명시적으로 받아 애플리케이션 UI에 연결한다.

```ts
export type AlertSurfaceProps = {
  open: boolean
  request: AlertRequest | null
  status: 'idle' | 'open' | 'closing'
  acknowledge(): void
  requestClose(): void
  completeClose(): void
}

export type ConfirmSurfaceProps = {
  open: boolean
  request: ConfirmRequest | null
  status: 'idle' | 'open' | 'pending' | 'error' | 'closing'
  error: unknown | null
  confirm(): void
  cancel(): void
  requestClose(): void
  completeClose(): void
}

export type OverlayRenderers = {
  alert: React.ComponentType<AlertSurfaceProps>
  confirm: React.ComponentType<ConfirmSurfaceProps>
}
```

실행 환경은 열림 상태, 대기열 동작, Promise 결과 처리를 소유한다. 렌더러는 화면 표현을 소유하고 `confirm`, `cancel`, `requestClose`를 호출한다. 닫힘 애니메이션이 끝나면 `completeClose`를 호출해 다음 대기 요청으로 전환한다. 렌더러가 그 외 생명주기 로직을 다시 구현해서는 안 된다.

## 생성되는 로컬 파일

기본 연결 방식은 Woon 컴포넌트를 패키지에서 렌더링하는 것이 아니라, 앱에 코드를 생성하는 방식이다.

```bash
pnpm dlx @woon-ui/cli add overlay
```

이 명령은 애플리케이션 의존성으로 `@woon-ui/core`와 `@base-ui/react`를 설치한다. 이미 설치된 버전은 그대로 사용하며, 생성된 파일이 앱의 Base UI를 직접 import한다.

```text
components/woon/
  overlay-provider.tsx
  alert.tsx
  confirm.tsx
```

생성되는 `confirm.tsx` 예시:

```tsx
import { AlertDialog } from '@base-ui/react/alert-dialog'
import type { ConfirmSurfaceProps } from '@woon-ui/core'

export function ConfirmSurface({
  open,
  request,
  status,
  cancel,
  completeClose,
  confirm,
  requestClose,
}: ConfirmSurfaceProps) {
  if (!request) return null

  const pending = status === 'pending'

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && requestClose()}
      onOpenChangeComplete={(nextOpen) => !nextOpen && completeClose()}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="overlay-backdrop" />
        <AlertDialog.Popup className="overlay-popup">
          <AlertDialog.Title>{request.title}</AlertDialog.Title>
          {request.description ? (
            <AlertDialog.Description>{request.description}</AlertDialog.Description>
          ) : null}
          {status === 'error' ? (
            <p role="alert">작업을 완료하지 못했습니다. 다시 시도해 주세요.</p>
          ) : null}
          <footer>
            <button disabled={pending} onClick={cancel}>
              {request.cancelLabel ?? '취소'}
            </button>
            <button
              aria-busy={pending}
              data-tone={request.tone}
              disabled={pending}
              onClick={confirm}
            >
              {pending ? <AppSpinner /> : request.confirmLabel}
            </button>
          </footer>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
```

애플리케이션은 이 JSX를 자유롭게 다시 작성하거나 스타일을 교체하고, 기존에 shadcn으로 생성한 컴포넌트를 사용할 수 있다. 렌더러 연결 계약만 유지하면 된다.

생성 템플릿은 내부 오류 정보가 그대로 사용자에게 노출되지 않도록 일반적인 실패 문구를 사용한다. 더 구체적인 오류 표현이 필요한 앱은 렌더러에 전달된 `error`를 안전한 사용자 문구로 변환해서 보여줄 수 있다.

## 렌더러 등록

```tsx
import { WoonProvider } from '@woon-ui/core'
import { AlertSurface } from '@/components/woon/alert'
import { ConfirmSurface } from '@/components/woon/confirm'

export function AppOverlayProvider({ children }: { children: React.ReactNode }) {
  return (
    <WoonProvider
      renderers={{
        alert: AlertSurface,
        confirm: ConfirmSurface,
      }}
    >
      {children}
    </WoonProvider>
  )
}
```

## 기존 커스텀 컴포넌트 연결

이미 컴포넌트가 있는 팀은 생성 파일을 새로 사용하지 않고 얇은 연결 코드를 등록할 수 있다.

```tsx
<WoonProvider
  renderers={{
    confirm: ({ open, request, status, cancel, confirm }) => (
      <DeleteConfirm
        open={open}
        pending={status === 'pending'}
        title={request?.title}
        onCancel={cancel}
        onConfirm={confirm}
      />
    ),
  }}
>
  {children}
</WoonProvider>
```

## MVP 이후 커스텀 오버레이

MVP 이후에는 `overlay.dialog()`이나 `overlay.drawer()`에 모든 형태를 억지로 맞추기보다, 앱이 오버레이를 이름과 종류로 등록하는 방식을 우선 검토한다.

```tsx
const appOverlays = createOverlayRegistry({
  projectSettings: defineOverlay<{ projectId: string }, void>({
    kind: 'drawer',
    renderer: ProjectSettingsDrawer,
  }),
  documentEditor: defineOverlay<{ documentId: string }, 'saved' | 'cancelled'>({
    kind: 'dialog',
    renderer: FullPageDocumentEditor,
  }),
  commandPalette: defineOverlay<void, void>({
    kind: 'custom',
    renderer: CommandPalette,
  }),
})

await appOverlays.open('projectSettings', { projectId })
```

`kind`는 기본 닫기 정책, 분석 분류, 중복 처리에 사용한다. 실제 크기, 위치, 풀페이지 여부, 특수한 모양은 로컬 렌더러가 결정한다. 따라서 다음 표현을 모두 지원할 수 있다.

- 일반 중앙 Dialog
- 좌우 Drawer와 모바일 Bottom Sheet
- 화면 전체를 덮는 풀페이지 모달
- 명령 팔레트처럼 특정 모양을 가진 커스텀 오버레이

이 등록형 API의 이름과 상세 타입은 `alert`, `confirm` MVP를 검증한 뒤 별도 RFC에서 확정한다.

## 중앙 관리 정책

초기에 지원할 정책은 다음과 같다.

- `dedupeKey`: 같은 사건에서 발생한 중복 확인창을 방지한다.
- `dismiss`: 바깥 영역 클릭이나 ESC를 통한 닫기를 허용하거나 차단한다.
- `tone`: `neutral` 또는 `danger` 값을 로컬 렌더러에 전달한다.
- 오버레이 쌓임: `alert`와 `confirm`은 하나의 대기열을 공유하며, 현재 요청만 결과를 확정할 수 있다.
- `dismissAll`: 라우트 전환이나 앱 종료 시 일시적인 오버레이를 모두 닫는다.
- 생명주기 연결점: 분석 도구를 위해 `onOpen`, `onConfirm`, `onCancel`, `onDismiss`를 제공한다.

대기열 우선순위, 라우트 전환 후 유지 여부, 오버레이 종류 간 동시 실행 제한은 실제 애플리케이션 사례로 API가 검증될 때까지 내부 구현으로 둔다.

## CLI와 업데이트 정책

생성된 오버레이 파일의 소유자는 애플리케이션이며, Woon이 자동으로 덮어쓰지 않는다.

vNext는 철학과 패키지 구조가 달라지는 `0.x` 단계의 중단적 변경으로 취급한다. 이전 CLI 명령과 런타임 API는 새 구현에 호환 계층으로 남기지 않고, 기존 버전은 Git 태그와 이전 릴리스에서만 보존한다.

| 명령어 | 동작 |
| --- | --- |
| `woon add overlay` | 없는 오버레이 파일과 설정을 생성한다. |
| `woon diff overlay` | 로컬 파일과 현재 Woon 템플릿의 차이를 보여준다. |
| `woon migrate overlay` | 안전성이 명확한 코드 변환만 적용한다. |

### `woon.json` 역할

`woon.json`은 CLI가 코드를 생성할 위치와 기반 라이브러리만 기록한다. React 컴포넌트 등록이나 실행 중 정책은 JSON에 넣지 않는다.

```json
{
  "$schema": "https://woon-ui.dev/schema.json",
  "paths": {
    "overlay": "src/woon/overlay"
  },
  "adapters": {
    "overlay": "base-ui"
  }
}
```

실제 렌더러 등록은 타입 검사를 받을 수 있는 `overlay-provider.tsx`에서 관리한다. 이 분리는 다음 장점이 있다.

- CLI는 생성 경로와 템플릿 종류만 알면 된다.
- 컴포넌트 import, props, 제네릭 타입을 TypeScript가 검사한다.
- JSON이 앱 실행 구조나 특정 번들러 방식과 결합되지 않는다.
- 사용자는 `woon.json`을 건드리지 않고 로컬 렌더러를 교체할 수 있다.

## 전환 순서

1. 기존 구현은 Git 태그와 마지막 `0.x` 릴리스로 보존한다.
2. `@woon-ui/core`와 `confirm` 수직 흐름을 새 기준선으로 만든다.
3. 위험한 작업 확인 흐름 하나를 전환하고 결과, 닫기, 중복, 키보드 동작을 검증한다.
4. 비동기 `onConfirm`의 대기·성공·실패·재시도 흐름을 검증한다.
5. `alert`를 추가하고 `alert`, `confirm` MVP를 완성한다.
6. `woon add overlay` 생성 흐름을 검증한 뒤 기존 프리미티브 패키지와 호환 코드를 별도 커밋에서 제거한다.
7. 등록형 커스텀 오버레이는 실제 Dialog, Drawer, 풀페이지 모달 사례를 모은 뒤 별도 RFC로 설계한다.

## 이번 RFC에서 확정한 결정

- 비동기 `onConfirm`을 선택적으로 지원한다. Woon은 대기·실패 상태만 관리하고 버튼과 스피너 표현은 로컬 렌더러가 맡는다.
- 첫 번째 MVP는 `alert`와 `confirm`만 구현하고 검증한다.
- Dialog, Drawer, 풀페이지 모달은 MVP 이후 이름 기반 등록형 오버레이로 확장하는 방향을 우선 검토한다.
- `woon.json`은 생성 경로와 기반 라이브러리만 기록한다. 렌더러 등록은 TypeScript 파일에서 관리한다.

## 비동기 처리 세부 결정

- Woon 코어는 `error` 값을 렌더러에 전달하고, 생성 템플릿은 안전한 일반 오류 문구를 제공한다.
- 실패 후 확인 버튼을 다시 누르면 같은 `onConfirm`을 재실행한다.
- MVP에서는 `pending` 중 닫기를 항상 차단한다. 실제 사례가 확인되기 전에는 강제 닫기 옵션을 공개 API에 추가하지 않는다.

## MVP 완료 기준

- Base UI 앱에서 Woon이 Base UI를 별도로 중복 설치하지 않고 로컬 `alert`, `confirm` 오버레이를 생성할 수 있다.
- `await overlay.alert()`는 사용자가 내용을 인지하고 닫은 뒤 완료된다.
- `await overlay.confirm()`은 렌더러의 확인 동작을 통해서만 `true`를 반환하고, 취소 또는 닫기를 통해 `false`를 반환한다.
- 같은 의도와 `dedupeKey`를 가진 요청이 동시에 여러 개 열리지 않는다.
- 비동기 `onConfirm` 실행 중 렌더러가 `pending` 상태를 받아 버튼과 스피너를 표현할 수 있다.
- 비동기 `onConfirm`이 실패하면 오버레이가 닫히지 않고 렌더러가 오류 상태를 받을 수 있다.
- Woon 코어를 수정하지 않고 로컬 JSX와 스타일을 교체할 수 있다.
- Base UI가 제공하는 키보드, 포커스, 스크린 리더 동작이 그대로 유지된다.
