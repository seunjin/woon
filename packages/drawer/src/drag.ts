const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll', 'overlay'])

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

export function canStartBottomCloseDrag(
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
    if (isScrollableY(element) && element.scrollTop > 0) {
      return false
    }

    if (element === contentElement) {
      return true
    }

    element = element.parentElement
  }

  return false
}
