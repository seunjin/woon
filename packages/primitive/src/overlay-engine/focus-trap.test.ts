import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getFocusableElements, trapFocus } from './focus-trap'

function makeButton(attrs: Record<string, string> = {}): HTMLButtonElement {
  const btn = document.createElement('button')
  for (const [k, v] of Object.entries(attrs)) btn.setAttribute(k, v)
  return btn
}

describe('getFocusableElements', () => {
  it('returns buttons, inputs, links, and tabindex elements', () => {
    const container = document.createElement('div')
    const btn = makeButton()
    const input = document.createElement('input')
    const a = document.createElement('a')
    a.setAttribute('href', '#')
    const div = document.createElement('div')
    div.setAttribute('tabindex', '0')

    container.append(btn, input, a, div)
    document.body.appendChild(container)

    expect(getFocusableElements(container)).toEqual([btn, input, a, div])

    document.body.removeChild(container)
  })

  it('excludes disabled buttons and inputs', () => {
    const container = document.createElement('div')
    const disabled = makeButton({ disabled: '' })
    const disabledInput = document.createElement('input')
    disabledInput.setAttribute('disabled', '')
    const normal = makeButton()

    container.append(disabled, disabledInput, normal)
    document.body.appendChild(container)

    expect(getFocusableElements(container)).toEqual([normal])

    document.body.removeChild(container)
  })

  it('excludes tabindex="-1" elements', () => {
    const container = document.createElement('div')
    const skipped = document.createElement('div')
    skipped.setAttribute('tabindex', '-1')
    const included = document.createElement('div')
    included.setAttribute('tabindex', '0')

    container.append(skipped, included)
    document.body.appendChild(container)

    expect(getFocusableElements(container)).toEqual([included])

    document.body.removeChild(container)
  })

  it('returns empty array when no focusable elements exist', () => {
    const container = document.createElement('div')
    container.appendChild(document.createElement('span'))
    document.body.appendChild(container)

    expect(getFocusableElements(container)).toEqual([])

    document.body.removeChild(container)
  })
})

describe('trapFocus', () => {
  let container: HTMLDivElement
  let first: HTMLButtonElement
  let second: HTMLButtonElement
  let third: HTMLButtonElement

  beforeEach(() => {
    container = document.createElement('div')
    first = makeButton()
    second = makeButton()
    third = makeButton()
    container.append(first, second, third)
    document.body.appendChild(container)
    first.focus()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('wraps Tab forward from last element to first', () => {
    third.focus()
    const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const preventDefault = vi.spyOn(e, 'preventDefault')

    trapFocus(container, e)

    expect(preventDefault).toHaveBeenCalled()
    expect(document.activeElement).toBe(first)
  })

  it('wraps Shift+Tab backward from first element to last', () => {
    first.focus()
    const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    const preventDefault = vi.spyOn(e, 'preventDefault')

    trapFocus(container, e)

    expect(preventDefault).toHaveBeenCalled()
    expect(document.activeElement).toBe(third)
  })

  it('does not intercept Tab when focus is not at the boundary', () => {
    second.focus()
    const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const preventDefault = vi.spyOn(e, 'preventDefault')

    trapFocus(container, e)

    expect(preventDefault).not.toHaveBeenCalled()
  })

  it('ignores non-Tab keys', () => {
    third.focus()
    const e = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    const preventDefault = vi.spyOn(e, 'preventDefault')

    trapFocus(container, e)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(third)
  })

  it('does nothing when container has no focusable elements', () => {
    const empty = document.createElement('div')
    document.body.appendChild(empty)
    const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const preventDefault = vi.spyOn(e, 'preventDefault')

    trapFocus(empty, e)

    expect(preventDefault).not.toHaveBeenCalled()

    document.body.removeChild(empty)
  })
})
