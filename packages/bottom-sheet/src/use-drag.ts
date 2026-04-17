import type React from 'react'
import { useCallback, useRef } from 'react'

type DragCallbacks = {
  onDrag: (deltaY: number) => void
  onEnd: (deltaY: number, velocityY: number) => void
}

type DragState = {
  active: boolean
  startY: number
  lastY: number
  lastTime: number
  velocityY: number
}

export function useDrag({ onDrag, onEnd }: DragCallbacks) {
  const state = useRef<DragState>({
    active: false,
    startY: 0,
    lastY: 0,
    lastTime: 0,
    velocityY: 0,
  })

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    state.current = {
      active: true,
      startY: e.clientY,
      lastY: e.clientY,
      lastTime: e.timeStamp,
      velocityY: 0,
    }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!state.current.active) return

      const now = e.timeStamp
      const dt = now - state.current.lastTime
      if (dt > 0) {
        state.current.velocityY = (e.clientY - state.current.lastY) / dt
      }
      state.current.lastY = e.clientY
      state.current.lastTime = now

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
      const velocityY = state.current.velocityY
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
