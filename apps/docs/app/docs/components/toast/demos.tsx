'use client'

import { toast } from '@woon-ui/toast'
import { Button } from '@/components/ui/Button'

export function BasicToastDemo() {
  return <Button onClick={() => toast({ title: '저장되었습니다' })}>기본 토스트</Button>
}

export function DescriptionToastDemo() {
  return (
    <Button
      onClick={() =>
        toast({
          title: '변경사항 저장됨',
          description: '모든 변경사항이 자동으로 저장되었습니다.',
        })
      }
    >
      설명 포함
    </Button>
  )
}

export function DangerToastDemo() {
  return (
    <Button
      onClick={() =>
        toast({ title: '네트워크 오류', description: '연결을 확인해주세요.' }, { tone: 'danger' })
      }
    >
      Danger 토스트
    </Button>
  )
}

export function ActionToastDemo() {
  return (
    <Button
      onClick={() =>
        toast(
          {
            title: '항목이 삭제되었습니다',
            action: {
              label: '되돌리기',
              onClick: () => toast({ title: '되돌렸습니다' }),
            },
          },
          { duration: Infinity },
        )
      }
    >
      액션 버튼
    </Button>
  )
}

export function UpdateToastDemo() {
  return (
    <Button
      onClick={() => {
        const handle = toast({ title: '업로드 중...' }, { duration: Infinity })
        setTimeout(() => {
          handle.update({ title: '업로드 완료!' })
          setTimeout(() => handle.close(), 2000)
        }, 2000)
      }}
    >
      업데이트 예제
    </Button>
  )
}

export function StackToastDemo() {
  return (
    <Button
      onClick={() => {
        for (let i = 1; i <= 5; i++) {
          setTimeout(() => toast({ title: `알림 #${i}` }), i * 200)
        }
      }}
    >
      스택 (5개)
    </Button>
  )
}
