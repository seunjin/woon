# Overlay Storybook

`apps/storybook`은 Woon vNext 오버레이의 내부 행동 검증 환경이다.

## 검증 범위

- `overlay.alert()` 인지 및 닫힘 흐름
- `overlay.confirm()` 확인·취소 결과
- 비동기 `onConfirm`의 pending·error·retry 상태
- `alert`와 `confirm`의 통합 대기열
- `dedupeKey` 중복 요청 병합
- 앱 로컬 Base UI 렌더러와 `@woon-ui/core`의 연결

## 구조

~~~text
.storybook/
  main.ts
  preview.tsx

src/
  preview.css
  stories/
    overlay-alert.stories.tsx
    overlay-confirm.stories.tsx
  woon/
    alert.tsx
    confirm.tsx
    overlay.css
~~~

`src/woon`은 CLI가 사용자 프로젝트에 생성하는 로컬 코드의 검증 기준이다. 코어는 이 JSX나 스타일을 소유하지 않는다.

## 명령어

~~~bash
pnpm dev:storybook
pnpm build:storybook
~~~
