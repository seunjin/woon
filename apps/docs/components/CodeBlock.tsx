import { codeToHtml } from 'shiki'

type Props = {
  children?: React.ReactNode
  className?: string
  [key: string]: unknown
}

// MDX가 렌더하는 pre > code 구조에서 언어와 코드 텍스트 추출
function extractCode(children: React.ReactNode): { code: string; lang: string } {
  // pre의 children이 code 엘리먼트인 경우
  if (
    children &&
    typeof children === 'object' &&
    'props' in (children as React.ReactElement) &&
    (children as React.ReactElement).type === 'code'
  ) {
    const codeEl = children as React.ReactElement<{ className?: string; children?: string }>
    const className = codeEl.props.className ?? ''
    // className은 "language-tsx" 형태
    const lang = className.replace('language-', '') || 'text'
    const code = String(codeEl.props.children ?? '').trimEnd()
    return { code, lang }
  }

  return { code: String(children ?? ''), lang: 'text' }
}

export async function CodeBlock({ children, ...rest }: Props) {
  const { code, lang } = extractCode(children)

  // Shiki가 모르는 언어는 plaintext로 폴백
  const supportedLangs = [
    'tsx',
    'typescript',
    'ts',
    'javascript',
    'js',
    'jsx',
    'bash',
    'sh',
    'json',
    'css',
    'html',
    'mdx',
    'md',
    'text',
    'plaintext',
  ]
  const safeLang = supportedLangs.includes(lang) ? lang : 'text'

  const html = await codeToHtml(code, {
    lang: safeLang,
    theme: 'github-dark',
    transformers: [],
  })

  return (
    // shiki가 생성한 <pre><code>...</code></pre> 를 그대로 삽입
    // prose.css의 pre 스타일 대신 shiki 인라인 스타일이 우선
    <div
      className="shiki-wrapper"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki 출력은 신뢰할 수 있는 HTML
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  )
}
