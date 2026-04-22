import type * as React from 'react'

// alert/confirm 렌더 컨텍스트 타입은 dialog 패키지에 정의되어 있으므로
// 여기서는 ComponentType<any>로 느슨하게 선언해 순환 의존성을 차단합니다.
// dialog 패키지의 ModalRoot에서 구체적인 타입으로 좁혀서 사용합니다.
export type WoonDefaultComponents = {
  // biome-ignore lint/suspicious/noExplicitAny: intentional — see comment above
  confirm?: React.ComponentType<any>
  // biome-ignore lint/suspicious/noExplicitAny: intentional — see comment above
  alert?: React.ComponentType<any>
}

// ─── imperative config store ─────────────────────────────────────────────────
// confirm() / alert()는 React 트리 밖에서 호출되므로
// ModalRoot가 설정을 여기에 동기화

let _defaults: WoonDefaultComponents = {}

export function setWoonDefaults(defaults: WoonDefaultComponents) {
  _defaults = defaults
}

export function getWoonDefaults(): WoonDefaultComponents {
  return _defaults
}
