# @woon-ui/cli

Woon이 관리하는 상태와 애플리케이션이 소유하는 로컬 UI 연결 코드를 생성하는 CLI다.

## 오버레이 설치

```bash
pnpm dlx @woon-ui/cli add overlay
```

이 명령은 다음 작업을 수행한다.

- `@woon-ui/core`와 `@base-ui/react`를 애플리케이션 의존성으로 설치한다.
- `src/woon/overlay`에 `alert.tsx`, `confirm.tsx`, `overlay-provider.tsx`, `overlay.css`를 생성한다.
- 기존 파일은 덮어쓰지 않는다.
- 앱 루트에 `AppOverlayProvider`를 연결하는 다음 단계를 출력한다.

전체 연결 예제가 필요하면 `--verbose`를 사용한다.

```bash
pnpm dlx @woon-ui/cli add overlay --verbose
```

첫 번째 `add` 명령은 `woon.json`이 없으면 자동으로 생성한다. `paths.overlay`는 오버레이 로컬 파일 경로이며, `adapters.overlay`는 생성 템플릿이 사용하는 기반 프리미티브를 기록한다.

vNext CLI는 이전 `dialog`, `toast`, `drawer` 생성 명령과 호환되지 않는다. 이전 구현은 Git 태그와 릴리스에서만 유지하며 새 CLI에는 호환 계층을 두지 않는다.
