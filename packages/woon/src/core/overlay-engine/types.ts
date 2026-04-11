import type * as React from 'react'

export type DialogOptions = {
  /**
   * 다이얼로그 뒤에 반투명 배경(오버레이)을 렌더링합니다.
   * `false`로 설정하면 `Dialog.Overlay`가 렌더링되지 않으며, 사이드패널 등 오버레이가 불필요한 UI에 활용합니다.
   * @default true
   */
  overlay: boolean
  /**
   * 포커스 트랩 활성화 여부. `true`일 때 Tab 이동이 다이얼로그 내부로 제한됩니다.
   * 오버레이 없이 배경과 상호작용을 허용하는 UI(사이드패널 등)에서는 `false`로 설정합니다.
   * @default true
   */
  trapFocus: boolean
  /**
   * 다이얼로그가 열려 있는 동안 `body` 스크롤을 잠급니다.
   * 여러 다이얼로그가 중첩되어도 참조 카운팅으로 마지막 다이얼로그가 닫힐 때 해제됩니다.
   * @default true
   */
  scrollLock: boolean
  /**
   * 오버레이 영역 클릭 시 다이얼로그를 닫습니다.
   * `alert()` / `confirm()`은 실수로 닫히는 것을 방지하기 위해 기본값이 `false`입니다.
   * @default true (`alert` / `confirm` 프리셋에서는 `false`)
   */
  closeOnOverlayClick: boolean
}

export type DialogResult<T> =
  | { status: 'resolved'; value: T }
  | { status: 'dismissed'; value: undefined }

export type DialogDataUpdater<T> = T | ((prev: T) => T)

export type DialogRenderContext = {
  data: unknown
  close: () => void
  resolve: (value: unknown) => void
  update: (next: DialogDataUpdater<unknown>) => void
}

export type DialogStatus = 'open' | 'closed'

export type DialogInstance = {
  id: string
  data: unknown
  render: (ctx: DialogRenderContext) => React.ReactNode
  options: DialogOptions
  /** dialog.open()에서 명시적으로 넘긴 옵션만 (Dialog.Root 병합용) */
  partialOptions?: Partial<DialogOptions>
  zIndex: number
  status: DialogStatus
  settled: boolean
  settle?: (result: DialogResult<unknown>) => void
}

export const DEFAULT_DIALOG_OPTIONS: DialogOptions = {
  overlay: true,
  trapFocus: true,
  scrollLock: true,
  closeOnOverlayClick: true,
}
