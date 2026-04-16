import type { WoonDefaultComponents, WoonPlugin } from '@woon-ui/primitive'
import {
  Portal,
  setBaseZIndex,
  setDefaultScrollTarget,
  setWoonDefaults,
  useOverlayStore,
} from '@woon-ui/primitive'
import { DialogRenderer } from './renderer'

export type DialogPluginOptions = {
  /**
   * alert() / confirm() 기본 컴포넌트 override.
   * 미설정 시 라이브러리 내장 컴포넌트를 사용합니다.
   */
  render?: WoonDefaultComponents
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

function DialogPluginRenderer({
  render,
  zIndex = 200,
  scrollTarget = null,
}: {
  render: WoonDefaultComponents | undefined
  zIndex: number
  scrollTarget: string | Element | null
}) {
  const { dialogs } = useOverlayStore()
  setBaseZIndex(zIndex)
  setWoonDefaults(render ?? ({} as WoonDefaultComponents))
  setDefaultScrollTarget(scrollTarget)
  return (
    <Portal>
      {dialogs.map((dialog) => (
        <DialogRenderer key={dialog.id} dialog={dialog} />
      ))}
    </Portal>
  )
}

export function dialogPlugin(options: DialogPluginOptions = {}): WoonPlugin {
  return {
    id: 'woon/dialog',
    render: () => (
      <DialogPluginRenderer
        render={options.render}
        zIndex={options.zIndex ?? 200}
        scrollTarget={options.scrollTarget ?? null}
      />
    ),
  }
}
