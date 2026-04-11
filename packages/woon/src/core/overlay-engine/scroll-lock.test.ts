import { afterEach, describe, expect, it } from 'vitest'
import { lockScroll, unlockScroll } from './scroll-lock'

// 각 테스트 후 body 스타일 초기화 및 내부 카운터 리셋
afterEach(() => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  // 혹시 남은 락이 있으면 강제 해제
  while (document.body.style.overflow === 'hidden') {
    unlockScroll()
  }
})

describe('lockScroll', () => {
  it('body overflow를 hidden으로 설정한다', () => {
    lockScroll()

    expect(document.body.style.overflow).toBe('hidden')

    unlockScroll()
  })

  it('잠그기 전 overflow 값을 복원한다', () => {
    document.body.style.overflow = 'auto'

    lockScroll()
    unlockScroll()

    expect(document.body.style.overflow).toBe('auto')
  })

  it('참조 카운팅: 두 번 잠근 후 한 번 해제해도 잠긴 상태 유지', () => {
    lockScroll()
    lockScroll()
    unlockScroll()

    expect(document.body.style.overflow).toBe('hidden')

    unlockScroll()
  })

  it('참조 카운팅: 두 번 잠근 후 두 번 해제하면 복원된다', () => {
    lockScroll()
    lockScroll()
    unlockScroll()
    unlockScroll()

    expect(document.body.style.overflow).not.toBe('hidden')
  })
})

describe('unlockScroll', () => {
  it('잠기지 않은 상태에서 호출해도 카운터가 음수가 되지 않는다', () => {
    // 에러 없이 실행되어야 함
    expect(() => unlockScroll()).not.toThrow()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('잠금 해제 시 paddingRight도 복원한다', () => {
    document.body.style.paddingRight = '4px'

    lockScroll()
    unlockScroll()

    expect(document.body.style.paddingRight).toBe('4px')
  })
})
