'use client'

import { alert } from '@woon/core/dialog'

export function BasicAlertDemo() {
  return (
    <button
      type="button"
      onClick={() => alert({ title: '저장되었습니다', description: '변경사항이 저장되었습니다.' })}
    >
      기본 알림
    </button>
  )
}

export function DangerAlertDemo() {
  return (
    <button
      type="button"
      onClick={() =>
        alert({
          title: '접근 권한이 없습니다',
          description: '관리자에게 문의하세요.',
          tone: 'danger',
        })
      }
    >
      Danger 알림
    </button>
  )
}

export function CustomLabelDemo() {
  return (
    <button
      type="button"
      onClick={() =>
        alert({
          title: '파일이 삭제되었습니다',
          description: '휴지통에서 복구할 수 있습니다.',
          confirmLabel: '알겠습니다',
        })
      }
    >
      커스텀 버튼 텍스트
    </button>
  )
}

export function AwaitAlertDemo() {
  return (
    <button
      type="button"
      onClick={async () => {
        await alert({ title: '이 작업을 확인해주세요' })
        await alert({ title: '확인되었습니다', description: '다음 단계로 진행합니다.' })
      }}
    >
      순차 알림 (await)
    </button>
  )
}
