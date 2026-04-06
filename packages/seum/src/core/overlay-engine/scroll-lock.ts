let lockCount = 0
let prevOverflow = ''
let prevPaddingRight = ''

export function lockScroll(): void {
  if (typeof document === 'undefined') return

  if (lockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    prevOverflow = document.body.style.overflow
    prevPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
  }

  lockCount++
}

export function unlockScroll(): void {
  if (typeof document === 'undefined') return

  lockCount = Math.max(0, lockCount - 1)

  if (lockCount === 0) {
    document.body.style.overflow = prevOverflow
    document.body.style.paddingRight = prevPaddingRight
  }
}
