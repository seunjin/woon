import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // prose.css가 시각 스타일을 담당
    // 여기서는 rehype-slug가 붙인 id 등 HTML 어트리뷰트만 통과시킴

    // pre > code 중첩 처리: pre 안의 code는 인라인 스타일 적용 안 됨 (prose.css에서 처리)
    // 추후 syntax highlighting, copy 버튼 등 기능 확장 시 이 파일에서 관리

    ...components,
  }
}
