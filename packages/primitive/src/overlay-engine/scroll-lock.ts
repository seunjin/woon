let lockCount = 0
let lockedElement: Element | null = null
let defaultScrollTarget: string | Element | null = null

export function setDefaultScrollTarget(target: string | Element | null): void {
  defaultScrollTarget = target
}

function resolveTarget(scrollTarget?: string | Element | null): Element {
  const target = scrollTarget ?? defaultScrollTarget
  if (typeof target === 'string') {
    return document.querySelector(target) ?? document.body
  }
  return target ?? document.body
}

export function lockScroll(scrollTarget?: string | Element | null): void {
  if (typeof document === 'undefined') return

  if (lockCount === 0) {
    lockedElement = resolveTarget(scrollTarget)
    lockedElement.setAttribute('data-woon-scroll-lock', '')
  }

  lockCount++
}

export function unlockScroll(): void {
  if (typeof document === 'undefined') return

  lockCount = Math.max(0, lockCount - 1)

  if (lockCount === 0 && lockedElement) {
    lockedElement.removeAttribute('data-woon-scroll-lock')
    lockedElement = null
  }
}

/** @internal 테스트 전용 */
export function _resetScrollLock(): void {
  lockCount = 0
  lockedElement?.removeAttribute('data-woon-scroll-lock')
  lockedElement = null
  defaultScrollTarget = null
}
