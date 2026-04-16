import { createContext } from 'react'

// @woon-ui/react 레벨의 Config Context
// 현재는 빈 객체 — 추후 확장 가능
export const WoonConfigContext = createContext<Record<string, never>>({})
