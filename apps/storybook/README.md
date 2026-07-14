# Storybook

`apps/storybook`은 woon 컴포넌트의 내부 개발/검증 환경입니다.
공식 문서 사이트가 아니라, 컴포넌트별 행동 시나리오를 빠르게 재현하고 회귀를 확인하는 공간입니다.

## 역할

- `apps/docs`: 사용자용 문서와 공개 라이브 데모
- `apps/storybook`: 내부 개발용 behavior lab
- `packages/*`: 실제 라이브러리 구현과 배포 CSS

Storybook story는 시각 쇼케이스보다 행동 검증을 우선합니다. focus trap, focus restore, ESC 처리, keyboard navigation, overlay stacking, anchored positioning, drag-to-close, imperative API 같은 케이스를 명확히 분리합니다.

## 구조

```txt
.storybook/
  main.ts        # React Vite Storybook 설정
  preview.tsx   # @woon-ui/react/css + DialogRuntime + Toaster 전역 mount

src/
  preview.css   # Storybook 전용 reset/layout
  examples/     # local scaffold 예시
  stories/      # 컴포넌트별 behavior stories
```

## 작성 원칙

- story 파일은 `src/stories/[component].stories.tsx` 형식으로 둡니다.
- story title은 `Components/[Component]` 형식을 사용합니다.
- 라이브러리 CSS는 `.storybook/preview.tsx`에서 `@woon-ui/react/css`를 한 번만 import합니다.
- Storybook 전용 스타일은 `src/preview.css`에만 둡니다.
- 사용자가 직접 복사할 수 있는 local scaffold 예시는 `src/examples/`에 둡니다.
- public API나 배포 CSS를 바꾸는 문제를 발견하면 `packages/*`와 `apps/docs`의 복사용 CSS/예시를 함께 갱신합니다.

## 명령어

```bash
pnpm dev:storybook
pnpm build:storybook
```

root의 `pnpm dev`는 packages watch와 Storybook을 함께 실행합니다.
