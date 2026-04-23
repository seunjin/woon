import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const cliBin = path.join(repoRoot, 'packages', 'cli', 'dist', 'bin.js')
const fixturesRoot = path.join(repoRoot, 'fixtures', 'cli')

const fixtures = [
  {
    name: 'next-app-router',
    expectedFramework: 'next-app-router',
    expectedToastImport: '@/woon/ui/toast',
    expectedRuntimeFile: 'src/app/layout.tsx',
    expectedUiPath: 'src/woon/ui',
  },
  {
    name: 'vite-react',
    expectedFramework: 'vite-react',
    expectedToastImport: './woon/ui/toast',
    expectedRuntimeFile: 'src/main.tsx',
    expectedUiPath: 'src/woon/ui',
  },
]

function runNode(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliBin, ...args], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
        return
      }

      reject(new Error(`CLI exited with code ${code}\n${stdout}\n${stderr}`))
    })
  })
}

async function verifyFixture(workspaceRoot, fixture) {
  const workingDir = path.join(workspaceRoot, fixture.name)
  await cp(path.join(fixturesRoot, fixture.name), workingDir, { recursive: true })

  const firstRun = await runNode(
    ['add', 'dialog', 'toast', '--skip-install', '--cwd', workingDir],
    repoRoot,
  )
  const secondRun = await runNode(
    ['add', 'dialog', 'toast', '--skip-install', '--cwd', workingDir],
    repoRoot,
  )
  const verboseRun = await runNode(
    ['add', 'dialog', 'toast', '--skip-install', '--cwd', workingDir, '--verbose'],
    repoRoot,
  )

  const config = JSON.parse(await readFile(path.join(workingDir, 'woon.json'), 'utf8'))
  const uiIndex = await readFile(path.join(workingDir, fixture.expectedUiPath, 'index.ts'), 'utf8')
  const dialogFile = await readFile(
    path.join(workingDir, fixture.expectedUiPath, 'dialog.tsx'),
    'utf8',
  )
  const toastFile = await readFile(
    path.join(workingDir, fixture.expectedUiPath, 'toast.tsx'),
    'utf8',
  )

  assert.equal(config.framework, fixture.expectedFramework)
  assert.equal(config.paths.ui, fixture.expectedUiPath)
  assert.match(firstRun.stdout, /Added dialog, toast/)
  assert.match(firstRun.stdout, new RegExp(`Local UI path: ${fixture.expectedUiPath}`))
  assert.match(
    firstRun.stdout,
    new RegExp(
      `Mount DialogRuntime once in ${fixture.expectedRuntimeFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    ),
  )
  assert.match(
    firstRun.stdout,
    new RegExp(
      `Mount Toaster with Toast from '${fixture.expectedToastImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' once in ${fixture.expectedRuntimeFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    ),
  )
  assert.match(firstRun.stdout, /https:\/\/woon-ui\.vercel\.app\/docs\/installation/)
  assert.match(firstRun.stdout, /https:\/\/woon-ui\.vercel\.app\/docs\/components\/dialog/)
  assert.match(firstRun.stdout, /https:\/\/woon-ui\.vercel\.app\/docs\/components\/toast/)
  assert.doesNotMatch(firstRun.stdout, /import \{ Toast \} from/)
  assert.match(
    firstRun.stdout,
    /Run the same command with --verbose to print the full runtime snippets/,
  )
  assert.match(secondRun.stdout, /Kept existing:/)
  assert.match(secondRun.stdout, /src\/woon\/ui\/dialog\.tsx/)
  assert.match(secondRun.stdout, /src\/woon\/ui\/toast\.tsx/)
  assert.match(verboseRun.stdout, /Runtime snippets:/)
  assert.match(verboseRun.stdout, /Dialog runtime/)
  assert.match(verboseRun.stdout, /Toast runtime/)
  assert.match(
    verboseRun.stdout,
    new RegExp(
      `import \\{ Toast \\} from '${fixture.expectedToastImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`,
    ),
  )
  assert.match(uiIndex, /export \* from '\.\/dialog'/)
  assert.match(uiIndex, /export \* from '\.\/toast'/)
  assert.match(dialogFile, /import '\.\/dialog\.css'/)
  assert.match(toastFile, /import '\.\/toast\.css'/)

  console.log(`PASS ${fixture.name}`)
}

async function main() {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'woon-cli-fixtures-'))

  try {
    for (const fixture of fixtures) {
      await verifyFixture(tmpRoot, fixture)
    }
  } finally {
    await rm(tmpRoot, { recursive: true, force: true })
  }
}

await main()
