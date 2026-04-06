import { loader, type Source } from 'fumadocs-core/source'
import { resolveFiles } from 'fumadocs-mdx'
import { docs } from '@/.source'

type Doc = (typeof docs.docs)[number]
type Meta = (typeof docs.meta)[number]

const contentSource: Source<{
  pageData: Doc
  metaData: Meta
}> = {
  files: resolveFiles({
    docs: docs.docs,
    meta: docs.meta,
  }) as Source<{
    pageData: Doc
    metaData: Meta
  }>['files'],
}

export const source = loader({
  baseUrl: '/docs',
  source: contentSource,
})
