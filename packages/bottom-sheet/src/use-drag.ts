import type React from 'react'
import { useCallback, useRef } from 'react'

type DragCallbacks = {
  onDrag: (deltaY: number) => void
  onEnd: (deltaY: number, velocityY: number) => void
}

// velocity 계산에 사용할 최근 이동 샘플
type MoveSample = { y: number; t: number }

const VELOCITY_WINDOW_MS = 100

type DragState = {
  active: boolean
  startY: number
  samples: MoveSample[] // 최근 VELOCITY_WINDOW_MS 내 샘플
}

/** 샘플 윈도우 전체를 선형회귀해서 velocity(px/ms) 계산 */
function calcVelocity(samples: MoveSample[]): number {
  if (samples.length < 2) return 0
  const first = samples[0]
  const last = samples[samples.length - 1]
  const dt = last.t - first.t
  if (dt <= 0) return 0
  return (last.y - first.y) / dt
}

export function useDrag({ onDrag, onEnd }: DragCallbacks) {
  const state = useRef<DragState>({
    active: false,
    startY: 0,
    samples: [],
  })

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    state.current = {
      active: true,
      startY: e.clientY,
      samples: [{ y: e.clientY, t: e.timeStamp }],
    }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!state.current.active) return

      const now = e.timeStamp
      // 윈도우 밖 오래된 샘플 제거 후 추가
      state.current.samples = [
        ...state.current.samples.filter((s) => now - s.t <= VELOCITY_WINDOW_MS),
        { y: e.clientY, t: now },
      ]

      const deltaY = e.clientY - state.current.startY
      onDrag(deltaY)
    },
    [onDrag],
  )

  const finish = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!state.current.active) return
      state.current.active = false

      const deltaY = e.clientY - state.current.startY
      const velocityY = calcVelocity(state.current.samples)
      onEnd(deltaY, velocityY)
    },
    [onEnd],
  )

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!state.current.active) return
      state.current.active = false
      const deltaY = e.clientY - state.current.startY
      onEnd(deltaY, 0)
    },
    [onEnd],
  )

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
    onPointerCancel,
  }
}
