function parseTimeValue(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return 0
  if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed)
  if (trimmed.endsWith('s')) return Number.parseFloat(trimmed) * 1000
  return 0
}

function getLongestTime(durationList: string, delayList: string): number {
  const durations = durationList.split(',').map(parseTimeValue)
  const delays = delayList.split(',').map(parseTimeValue)
  const count = Math.max(durations.length, delays.length)

  let max = 0
  for (let index = 0; index < count; index += 1) {
    const duration = durations[index] ?? durations[durations.length - 1] ?? 0
    const delay = delays[index] ?? delays[delays.length - 1] ?? 0
    max = Math.max(max, duration + delay)
  }

  return max
}

export function getExitDuration(root: HTMLElement): number {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]

  return elements.reduce((max, element) => {
    const style = window.getComputedStyle(element)
    const transitionTime = getLongestTime(style.transitionDuration, style.transitionDelay)
    const animationTime = getLongestTime(style.animationDuration, style.animationDelay)
    return Math.max(max, transitionTime, animationTime)
  }, 0)
}

export function getRunningAnimations(root: HTMLElement): Animation[] {
  if (typeof root.getAnimations !== 'function') return []

  return root.getAnimations({ subtree: true }).filter((animation) => {
    const duration = animation.effect?.getTiming().duration
    return typeof duration === 'number' && duration > 0 && animation.playState !== 'finished'
  })
}

export function waitForExit(root: HTMLElement, onDone: () => void): () => void {
  let cancelled = false
  let timeoutId: number | undefined
  let rafId1: number | undefined
  let rafId2: number | undefined

  const finish = () => {
    if (cancelled) return
    cancelled = true
    if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    onDone()
  }

  const check = () => {
    const animations = getRunningAnimations(root)

    if (animations.length > 0) {
      Promise.allSettled(animations.map((a) => a.finished)).finally(finish)
      const fallback = getExitDuration(root)
      if (fallback > 0) timeoutId = window.setTimeout(finish, fallback + 50)
      return
    }

    const exitDuration = getExitDuration(root)
    if (exitDuration > 0) {
      timeoutId = window.setTimeout(finish, exitDuration + 50)
      return
    }

    finish()
  }

  rafId1 = window.requestAnimationFrame(() => {
    rafId2 = window.requestAnimationFrame(check)
  })

  return () => {
    cancelled = true
    if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    if (rafId1 !== undefined) window.cancelAnimationFrame(rafId1)
    if (rafId2 !== undefined) window.cancelAnimationFrame(rafId2)
  }
}
