// top-level import/export 없어야 script 파일로 인식 → declare module 확장 가능
declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types'

  type TocItem = {
    id: string
    label: string
    depth: 2 | 3
  }

  export default function MDXContent(props: MDXProps): JSX.Element
  export const toc: TocItem[]
}
