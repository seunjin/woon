import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { getOverlayScaffoldFiles } from './templates'

const storybookOverlayDirectory = new URL('../../../apps/storybook/src/woon/', import.meta.url)
const storybookPreview = new URL('../../../apps/storybook/.storybook/preview.tsx', import.meta.url)

const scaffoldFiles = new Map(
  getOverlayScaffoldFiles().map((file) => [file.name, file.content] as const),
)

describe('overlay 생성 템플릿', () => {
  it.each([
    'alert.tsx',
    'confirm.tsx',
    'overlay.css',
  ])('%s가 Storybook 검증본과 일치한다', async (name) => {
    const storybookFile = fileURLToPath(new URL(name, storybookOverlayDirectory))
    const storybookContent = await readFile(storybookFile, 'utf8')

    expect(storybookContent).toBe(scaffoldFiles.get(name))
  })

  it('생성 Provider와 Storybook이 동일한 렌더러 등록 계약을 사용한다', async () => {
    const registration = 'renderers={{ alert: AlertSurface, confirm: ConfirmSurface }}'
    const providerTemplate = scaffoldFiles.get('overlay-provider.tsx')
    const previewContent = await readFile(fileURLToPath(storybookPreview), 'utf8')

    expect(providerTemplate).toContain(registration)
    expect(previewContent).toContain(registration)
  })
})
