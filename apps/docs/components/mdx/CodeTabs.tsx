import { codeToHtml } from 'shiki'
import { SHIKI_SUPPORTED_LANGS, shikiTransformers } from '@/components/CodeBlock'
import { CodeTabsClient } from './CodeTabsClient'

type Tab = {
  label: string
  code: string
  lang?: string
}

export async function CodeTabs({ tabs }: { tabs: Tab[] }) {
  const rendered = await Promise.all(
    tabs.map(async (tab) => {
      const safeLang = SHIKI_SUPPORTED_LANGS.includes(tab.lang ?? '')
        ? (tab.lang as string)
        : 'text'
      const html = await codeToHtml(tab.code, {
        lang: safeLang,
        theme: 'github-light-default',
        transformers: shikiTransformers,
      })
      return { label: tab.label, code: tab.code, html }
    }),
  )

  return <CodeTabsClient tabs={rendered} />
}
