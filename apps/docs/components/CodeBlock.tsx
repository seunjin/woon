import { codeToHtml } from 'shiki'
import { CopyButton } from './CopyButton'

type Props = {
  children?: React.ReactNode
  className?: string
  [key: string]: unknown
}

// MDX가 렌더하는 pre > code 구조에서 언어와 코드 텍스트 추출
function extractCode(children: React.ReactNode): {
  code: string
  lang: string
} {
  if (
    children &&
    typeof children === 'object' &&
    'props' in (children as React.ReactElement) &&
    (children as React.ReactElement).type === 'code'
  ) {
    const codeEl = children as React.ReactElement<{
      className?: string
      children?: string
    }>
    const className = codeEl.props.className ?? ''
    const lang = className.replace('language-', '') || 'text'
    const code = String(codeEl.props.children ?? '').trimEnd()
    return { code, lang }
  }

  return { code: String(children ?? ''), lang: 'text' }
}

export const SHIKI_SUPPORTED_LANGS = [
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

export const shikiTransformers = [
  {
    // Shiki 인라인 background-color 제거 — CSS에서 디자인 토큰으로 제어
    pre(node: { properties: { style?: string | undefined } }) {
      if (node.properties.style) {
        node.properties.style = String(node.properties.style)
          .replace(/background-color:[^;]+;?\s*/g, '')
          .trim()
      }
    },
  },
]

export async function CodeBlock({ children }: Props) {
  const { code, lang } = extractCode(children)
  const safeLang = SHIKI_SUPPORTED_LANGS.includes(lang) ? lang : 'text'

  const html = await codeToHtml(code, {
    lang: safeLang,
    theme: 'github-light-default',
    transformers: shikiTransformers,
  })

  return (
    <div className="shiki-wrapper">
      <CopyButton code={code} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: shiki 출력은 신뢰할 수 있는 HTML */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
