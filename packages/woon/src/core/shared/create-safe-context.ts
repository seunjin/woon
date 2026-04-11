import { createContext, use } from 'react'

/**
 * Context를 생성하고, Root 밖에서 사용하면 명확한 에러를 던지는 Hook을 반환합니다.
 *
 * @example
 * const [DialogContext, useDialogContext] = createSafeContext<DialogContextValue>('Dialog')
 */
export function createSafeContext<T>(componentName: string) {
  const Context = createContext<T | null>(null)

  function useSafeContext(): T {
    const ctx = use(Context)
    if (ctx === null) {
      throw new Error(
        `[Seum] \`${componentName}\` 컴포넌트는 \`${componentName}.Root\` 안에서만 사용할 수 있습니다.`,
      )
    }
    return ctx
  }

  return [Context, useSafeContext] as const
}
