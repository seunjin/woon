import type { ReactNode } from 'react'

type StepsProps = {
  children: ReactNode
}

type StepProps = {
  children: ReactNode
}

export function Steps({ children }: StepsProps) {
  return <div className="steps">{children}</div>
}

export function Step({ children }: StepProps) {
  return <div className="step">{children}</div>
}
