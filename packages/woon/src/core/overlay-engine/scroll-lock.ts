let lockCount = 0
let lockedElement: Element | null = null

function resolveTarget(scrollTarget?: string | Element | null): Element {
  if (typeof scrollTarget === 'string') {
    return document.querySelector(scrollTarget) ?? document.body
  }
  return scrollTarget ?? document.body
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
}
