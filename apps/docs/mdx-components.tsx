import type { MDXComponents } from 'mdx/types'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout } from '@/components/mdx/Callout'
import { CodeTabs } from '@/components/mdx/CodeTabs'
import { DemoBox } from '@/components/mdx/DemoBox'
import { DocExample } from '@/components/mdx/DocExample'
import { PackageManagerTabs } from '@/components/mdx/PackageManagerTabs'
import { PartsTable } from '@/components/mdx/PartsTable'
import { PropsTable } from '@/components/mdx/PropsTable'
import { Step, Steps } from '@/components/mdx/Steps'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // pre > code 블록을 Shiki 서버 컴포넌트로 교체
    pre: (props) => <CodeBlock {...props} />,
    // MDX에서 컴포넌트명으로 바로 사용 가능
    Callout,
    CodeTabs,
    DemoBox,
    DocExample,
    PackageManagerTabs,
    PartsTable,
    PropsTable,
    Steps,
    Step,
  }
}
