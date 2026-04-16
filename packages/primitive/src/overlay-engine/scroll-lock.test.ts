import { afterEach, describe, expect, it } from 'vitest'
import { _resetScrollLock, lockScroll, unlockScroll } from './scroll-lock'

afterEach(() => {
  _resetScrollLock()
})

describe('lockScroll', () => {
  it('body에 data-woon-scroll-lock 속성을 추가한다', () => {
    lockScroll()

    expect(document.body.hasAttribute('data-woon-scroll-lock')).toBe(true)

    unlockScroll()
  })

  it('참조 카운팅: 두 번 잠근 후 한 번 해제해도 잠긴 상태 유지', () => {
    lockScroll()
    lockScroll()
    unlockScroll()

    expect(document.body.hasAttribute('data-woon-scroll-lock')).toBe(true)

    unlockScroll()
  })

  it('참조 카운팅: 두 번 잠근 후 두 번 해제하면 속성이 제거된다', () => {
    lockScroll()
    lockScroll()
    unlockScroll()
    unlockScroll()

    expect(document.body.hasAttribute('data-woon-scroll-lock')).toBe(false)
  })

  it('scrollTarget 문자열 선택자에 해당하는 요소를 잠근다', () => {
    const el = document.createElement('div')
    el.id = 'scroll-container'
    document.body.appendChild(el)

    lockScroll('#scroll-container')

    expect(el.hasAttribute('data-woon-scroll-lock')).toBe(true)
    expect(document.body.hasAttribute('data-woon-scroll-lock')).toBe(false)

    unlockScroll()
    document.body.removeChild(el)
  })

  it('scrollTarget Element를 직접 전달하면 해당 요소를 잠근다', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    lockScroll(el)

    expect(el.hasAttribute('data-woon-scroll-lock')).toBe(true)

    unlockScroll()
    document.body.removeChild(el)
  })

  it('scrollTarget 선택자가 존재하지 않으면 body를 fallback으로 사용한다', () => {
    lockScroll('#does-not-exist')

    expect(document.body.hasAttribute('data-woon-scroll-lock')).toBe(true)

    unlockScroll()
  })
})

describe('unlockScroll', () => {
  it('잠기지 않은 상태에서 호출해도 에러가 발생하지 않는다', () => {
    expect(() => unlockScroll()).not.toThrow()
    expect(document.body.hasAttribute('data-woon-scroll-lock')).toBe(false)
  })

  it('해제 시 data-woon-scroll-lock 속성이 제거된다', () => {
    lockScroll()
    unlockScroll()

    expect(document.body.hasAttribute('data-woon-scroll-lock')).toBe(false)
  })
})
