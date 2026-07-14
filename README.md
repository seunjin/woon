# Woon

Base UI 기반 오버레이를 제품의 의도 단위로 중앙 관리하는 React 라이브러리다.

Woon은 Dialog, AlertDialog, Drawer 같은 접근성 프리미티브를 다시 구현하지 않는다. 애플리케이션이 소유한 Base UI 렌더러와 `overlay.alert()`, `overlay.confirm()` 호출 사이의 상태·결과·정책을 관리한다.

> Base UI는 동작의 기반을 제공하고, Woon은 제품에서 사용할 의미와 규칙을 관리한다.

## MVP

- `overlay.alert()`: 내용을 인지하고 닫는 단일 확인 흐름
- `overlay.confirm()`: 취소 또는 진행을 결정하는 양자 선택 흐름
- 하나의 중앙 대기열과 `dedupeKey` 중복 방지
- 선택적 비동기 `onConfirm`의 pending·error·retry 상태
- 앱이 직접 소유하고 수정하는 Base UI 로컬 렌더러

## 설치

~~~bash
pnpm dlx @woon-ui/cli add overlay
~~~

이 명령은 `@woon-ui/core`와 `@base-ui/react`를 설치하고 다음 파일을 생성한다.

~~~text
src/woon/overlay/
  alert.tsx
  confirm.tsx
  overlay-provider.tsx
  overlay.css
~~~

생성된 파일은 애플리케이션 코드다. Woon은 파일을 자동으로 덮어쓰지 않으며 JSX, 스타일, 버튼, 오류 표현을 자유롭게 수정할 수 있다.

## 사용

~~~tsx
import { useOverlay } from '@woon-ui/core'

function DeleteProjectButton() {
  const overlay = useOverlay()

  async function deleteProject() {
    const confirmed = await overlay.confirm({
      title: '프로젝트를 삭제할까요?',
      description: '삭제한 프로젝트는 복구할 수 없습니다.',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      tone: 'danger',
      onConfirm: async () => {
        await requestProjectDeletion()
      },
    })

    if (!confirmed) return
  }

  return <button onClick={deleteProject}>삭제</button>
}
~~~

앱 루트에는 CLI가 생성한 `AppOverlayProvider`를 한 번 연결한다.

## 패키지

| 패키지 | 역할 |
| --- | --- |
| `@woon-ui/core` | 오버레이 요청, Promise 결과, 대기열과 상태 관리 |
| `@woon-ui/cli` | Base UI 기반 로컬 렌더러와 Provider 생성 |

이전 Woon 프리미티브와 CLI 명령은 vNext에 호환 계층으로 남기지 않는다. 과거 구현은 Git 기록과 이전 릴리스에서 확인할 수 있다.

## 개발

~~~bash
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm build:storybook
pnpm test:package
~~~

PR과 `main` 브랜치 변경에는 GitHub Actions 품질 게이트가 실행된다. 린트, 타입 검사, 테스트, 패키지와 Storybook 빌드, 실제 CLI 배포물 설치 검증이 모두 통과해야 한다.

설계 결정은 [오버레이 의도 관리 시스템 RFC](docs/rfcs/0001-overlay-intent-system.md)에 기록한다.

## 라이선스

MIT
