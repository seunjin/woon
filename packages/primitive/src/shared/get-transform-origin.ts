type Side = 'top' | 'right' | 'bottom' | 'left'
type Align = 'start' | 'center' | 'end'

/**
 * 팝오버/툴팁 애니메이션 transform-origin 계산.
 * 원칙: 트리거가 있는 방향 = scale이 시작되는 지점.
 */
export function getTransformOrigin(side: string, align: Align): string {
  const mainOrigin: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  }
  const main = mainOrigin[side] ?? 'center'

  if (align === 'center') return `${main} center`

  // 수직 side(top/bottom)의 cross축은 수평(left/right)
  // 수평 side(left/right)의 cross축은 수직(top/bottom)
  const isVerticalSide = side === 'top' || side === 'bottom'
  const crossStart = isVerticalSide ? 'left' : 'top'
  const crossEnd = isVerticalSide ? 'right' : 'bottom'

  return `${main} ${align === 'start' ? crossStart : crossEnd}`
}

export type { Align, Side }
