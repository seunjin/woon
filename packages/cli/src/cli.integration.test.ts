import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { run } from './cli'

const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url))
const fixtureDirectories: string[] = []

async function createViteFixture(): Promise<string> {
  const fixtureDirectory = await mkdtemp(path.join(tmpdir(), 'woon-cli-'))
  fixtureDirectories.push(fixtureDirectory)

  await mkdir(path.join(fixtureDirectory, 'src'), { recursive: true })
  await symlink(
    path.join(repositoryRoot, 'packages/cli/node_modules'),
    path.join(fixtureDirectory, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir',
  )
  await writeFile(
    path.join(fixtureDirectory, 'package.json'),
    `${JSON.stringify(
      {
        private: true,
        dependencies: {
          '@base-ui/react': '*',
          '@woon-ui/core': '*',
          react: '*',
          'react-dom': '*',
          vite: '*',
        },
      },
      null,
      2,
    )}\n`,
  )
  await writeFile(path.join(fixtureDirectory, 'src/main.tsx'), 'export {}\n')
  await writeFile(
    path.join(fixtureDirectory, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          moduleResolution: 'Bundler',
          jsx: 'react-jsx',
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          baseUrl: repositoryRoot,
          paths: {
            '@woon-ui/core': ['packages/core/src/index.ts'],
          },
        },
        include: ['src/woon/overlay/**/*.ts', 'src/woon/overlay/**/*.tsx'],
      },
      null,
      2,
    )}\n`,
  )

  return fixtureDirectory
}

function compileFixture(fixtureDirectory: string): string {
  const configPath = path.join(fixtureDirectory, 'tsconfig.json')
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, fixtureDirectory)
  const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options)
  const diagnostics = [...parsedConfig.errors, ...ts.getPreEmitDiagnostics(program)]

  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => fixtureDirectory,
    getNewLine: () => '\n',
  })
}

afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(
    fixtureDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe('overlay CLI 통합', () => {
  it('실제 프로젝트에 생성하고 컴파일하며 사용자 수정을 보존한다', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const fixtureDirectory = await createViteFixture()

    await expect(
      run(['add', 'overlay', '--cwd', fixtureDirectory, '--skip-install']),
    ).resolves.toBe(0)

    const overlayDirectory = path.join(fixtureDirectory, 'src/woon/overlay')
    await expect(
      Promise.all(
        ['alert.tsx', 'confirm.tsx', 'overlay-provider.tsx', 'overlay.css', 'index.ts'].map(
          (fileName) => readFile(path.join(overlayDirectory, fileName), 'utf8'),
        ),
      ),
    ).resolves.toHaveLength(5)

    const config = JSON.parse(await readFile(path.join(fixtureDirectory, 'woon.json'), 'utf8'))
    expect(config).toMatchObject({
      framework: 'vite-react',
      paths: { overlay: 'src/woon/overlay' },
      adapters: { overlay: 'base-ui' },
    })
    expect(compileFixture(fixtureDirectory)).toBe('')

    const alertPath = path.join(overlayDirectory, 'alert.tsx')
    const customizedAlert = `${await readFile(alertPath, 'utf8')}\n// 사용자 커스텀\n`
    await writeFile(alertPath, customizedAlert)

    await run(['add', 'overlay', '--cwd', fixtureDirectory, '--skip-install'])

    expect(await readFile(alertPath, 'utf8')).toBe(customizedAlert)
    const indexContent = await readFile(path.join(overlayDirectory, 'index.ts'), 'utf8')
    expect(indexContent.match(/export \* from/g)).toHaveLength(3)
  })
})
