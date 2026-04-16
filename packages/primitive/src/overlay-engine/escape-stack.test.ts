import { afterEach, describe, expect, it, vi } from 'vitest'
import { popEscapeHandler, pushEscapeHandler } from './escape-stack'

function fireEscape() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

// 각 테스트 후 스택을 비워 싱글턴 상태 초기화
const pushed: (() => void)[] = []

afterEach(() => {
  for (const handler of pushed.splice(0)) {
    popEscapeHandler(handler)
  }
})

function push(handler: () => void) {
  pushed.push(handler)
  pushEscapeHandler(handler)
}

describe('escape-stack', () => {
  it('핸들러가 Escape 키에 반응한다', () => {
    const handler = vi.fn()
    push(handler)

    fireEscape()

    expect(handler).toHaveBeenCalledOnce()
  })

  it('여러 핸들러 중 가장 마지막(top)만 호출된다', () => {
    const first = vi.fn()
    const second = vi.fn()
    push(first)
    push(second)

    fireEscape()

    expect(second).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
  })

  it('top 핸들러를 제거하면 그 아래 핸들러가 응답한다', () => {
    const first = vi.fn()
    const second = vi.fn()
    push(first)
    push(second)

    popEscapeHandler(second)
    pushed.splice(pushed.indexOf(second), 1)

    fireEscape()

    expect(first).toHaveBeenCalledOnce()
    expect(second).not.toHaveBeenCalled()
  })

  it('pop으로 핸들러를 제거하면 더 이상 호출되지 않는다', () => {
    const handler = vi.fn()
    push(handler)

    popEscapeHandler(handler)
    pushed.splice(pushed.indexOf(handler), 1)

    fireEscape()

    expect(handler).not.toHaveBeenCalled()
  })

  it('스택이 비면 document 리스너가 해제된다', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const handler = vi.fn()
    push(handler)

    popEscapeHandler(handler)
    pushed.splice(pushed.indexOf(handler), 1)

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('Escape 외 키는 무시한다', () => {
    const handler = vi.fn()
    push(handler)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    expect(handler).not.toHaveBeenCalled()
  })
})
