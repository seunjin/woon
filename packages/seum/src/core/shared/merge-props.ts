type AnyProps = Record<string, unknown>

export function mergeProps<T extends AnyProps>(base: T, override: T): T {
  const result = { ...base, ...override }

  for (const key of Object.keys(result)) {
    const baseVal = base[key]
    const overrideVal = override[key]

    // 이벤트 핸들러는 둘 다 호출
    if (
      key.startsWith('on') &&
      typeof baseVal === 'function' &&
      typeof overrideVal === 'function'
    ) {
      result[key] = (...args: unknown[]) => {
        ;(baseVal as (...a: unknown[]) => void)(...args)
        ;(overrideVal as (...a: unknown[]) => void)(...args)
      }
      continue
    }

    // className 병합
    if (key === 'className' && typeof baseVal === 'string' && typeof overrideVal === 'string') {
      result[key] = [baseVal, overrideVal].filter(Boolean).join(' ')
      continue
    }

    // style 병합
    if (
      key === 'style' &&
      baseVal !== null &&
      overrideVal !== null &&
      typeof baseVal === 'object' &&
      typeof overrideVal === 'object'
    ) {
      result[key] = { ...(baseVal as object), ...(overrideVal as object) }
    }
  }

  return result
}
