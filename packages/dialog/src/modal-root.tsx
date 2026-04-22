import type { WoonDefaultComponents } from '@woon-ui/primitive'
import {
  Portal,
  setBaseZIndex,
  setDefaultScrollTarget,
  setWoonDefaults,
  useOverlayStore,
} from '@woon-ui/primitive'
import { DialogRenderer } from './renderer'

export type ModalRootComponents = WoonDefaultComponents

export type ModalRootProps = {
  /**
   * alert() / confirm() 기본 컴포넌트 override.
   * 미설정 시 라이브러리 내장 컴포넌트를 사용합니다.
   */
  components?: ModalRootComponents
  /**
   * dialog z-index 시작값. 다이얼로그가 쌓일수록 1씩 증가합니다.
   * @default 200
   */
  zIndex?: number
  /**
   * scrollLock의 기본 대상 요소. CSS 선택자 또는 Element를 전달합니다.
   * @default undefined (document.body)
   */
  scrollTarget?: string | Element | null
}

export function ModalRoot({ components, zIndex = 200, scrollTarget = null }: ModalRootProps) {
  const { dialogs } = useOverlayStore()

  setBaseZIndex(zIndex)
  setWoonDefaults(components ?? ({} as WoonDefaultComponents))
  setDefaultScrollTarget(scrollTarget)

  return (
    <Portal>
      {dialogs.map((dialog) => (
        <DialogRenderer key={dialog.id} dialog={dialog} />
      ))}
    </Portal>
  )
}
