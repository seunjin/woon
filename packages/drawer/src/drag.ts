import type { DrawerDirection } from './context'

const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll', 'overlay'])
const SCROLL_EPSILON = 1

function toElement(target: EventTarget | null): HTMLElement | null {
  if (target instanceof HTMLElement) return target
  if (target instanceof Node) return target.parentElement
  return null
}

function isScrollableY(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return (
    SCROLLABLE_OVERFLOW_VALUES.has(style.overflowY) && element.scrollHeight > element.clientHeight
  )
}

function isScrollableX(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return (
    SCROLLABLE_OVERFLOW_VALUES.has(style.overflowX) && element.scrollWidth > element.clientWidth
  )
}

function getMaxScrollTop(element: HTMLElement) {
  return Math.max(element.scrollHeight - element.clientHeight, 0)
}

function getMaxScrollLeft(element: HTMLElement) {
  return Math.max(element.scrollWidth - element.clientWidth, 0)
}

export function canStartCloseDrag(
  direction: DrawerDirection,
  target: EventTarget | null,
  contentElement: HTMLElement,
): boolean {
  const startElement = toElement(target)
  if (!startElement) return false

  const noDragRoot = startElement.closest('[data-woon-drawer-no-drag]')
  if (noDragRoot && contentElement.contains(noDragRoot)) {
    return false
  }

  let element: HTMLElement | null = startElement

  while (element) {
    if ((direction === 'top' || direction === 'bottom') && isScrollableY(element)) {
      if (direction === 'bottom' && element.scrollTop > SCROLL_EPSILON) {
        return false
      }

      if (direction === 'top' && element.scrollTop < getMaxScrollTop(element) - SCROLL_EPSILON) {
        return false
      }
    }

    if ((direction === 'left' || direction === 'right') && isScrollableX(element)) {
      if (direction === 'right' && element.scrollLeft > SCROLL_EPSILON) {
        return false
      }

      // Horizontal drag-to-close currently assumes LTR scrollLeft behavior.
      if (direction === 'left' && element.scrollLeft < getMaxScrollLeft(element) - SCROLL_EPSILON) {
        return false
      }
    }

    if (element === contentElement) {
      return true
    }

    element = element.parentElement
  }

  return false
}
