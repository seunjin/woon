type EscapeHandler = () => void

const stack: EscapeHandler[] = []
let attached = false

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && stack.length > 0) {
    e.preventDefault()
    stack.at(-1)?.()
  }
}

export function pushEscapeHandler(handler: EscapeHandler): void {
  stack.push(handler)
  if (!attached) {
    document.addEventListener('keydown', onKeyDown)
    attached = true
  }
}

export function popEscapeHandler(handler: EscapeHandler): void {
  const index = stack.indexOf(handler)
  if (index !== -1) stack.splice(index, 1)

  if (stack.length === 0 && attached) {
    document.removeEventListener('keydown', onKeyDown)
    attached = false
  }
}
