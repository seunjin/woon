'use client'

import { alert, confirm } from '@woon/core/dialog'
import { Button } from '@/components/ui/Button'

export function BasicConfirmDemo() {
  return (
    <Button
      onClick={async () => {
        const result = await confirm({
          title: '삭제하시겠습니까?',
          description: '이 작업은 되돌릴 수 없습니다.',
          tone: 'danger',
        })
        if (result.status === 'confirmed') {
          await alert({ title: '삭제되었습니다' })
        }
      }}
    >
      기본 확인
    </Button>
  )
}

export function CancelConfirmDemo() {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const result = await confirm({
          title: '변경사항을 저장하시겠습니까?',
          confirmLabel: '저장',
          cancelLabel: '버리기',
        })
        const message =
          result.status === 'confirmed'
            ? '저장되었습니다'
            : result.status === 'cancelled'
              ? '변경사항이 버려졌습니다'
              : '취소됨'
        await alert({ title: message })
      }}
    >
      결과 분기 확인
    </Button>
  )
}

export function AsyncConfirmDemo() {
  return (
    <Button
      onClick={() =>
        confirm({
          title: '배포하시겠습니까?',
          description: 'production 환경에 배포합니다.',
          onConfirm: () => new Promise((r) => setTimeout(r, 2000)),
          loading: { title: '배포 중입니다', description: '잠시만 기다려주세요.' },
          success: { title: '배포 완료', description: '정상적으로 배포되었습니다.' },
        })
      }
    >
      비동기 + loading/success
    </Button>
  )
}

export function ErrorConfirmDemo() {
  return (
    <Button
      onClick={() =>
        confirm({
          title: '전송하시겠습니까?',
          onConfirm: async () => {
            await new Promise((r) => setTimeout(r, 1000))
            throw new Error('네트워크 오류')
          },
          loading: { title: '전송 중...' },
          error: { title: '전송 실패', description: '잠시 후 다시 시도해주세요.' },
        })
      }
    >
      에러 처리
    </Button>
  )
}

export function RetryConfirmDemo() {
  let attempt = 0
  return (
    <Button
      variant="outline"
      onClick={() => {
        attempt = 0
        confirm({
          title: '전송하시겠습니까?',
          onConfirm: async () => {
            attempt++
            await new Promise((r) => setTimeout(r, 800))
            if (attempt < 3) throw new Error('실패')
          },
          loading: { title: '전송 중...' },
          success: { title: '전송 완료' },
          retryOnError: true,
        })
      }}
    >
      retryOnError (3번째 성공)
    </Button>
  )
}
