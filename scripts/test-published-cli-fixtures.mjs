import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
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

function parseArgs(argv) {
  let tag = 'latest'

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--tag') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('Missing value for --tag')
      }

      tag = value
      index += 1
      continue
    }

    if (arg.startsWith('--tag=')) {
      tag = arg.slice('--tag='.length)
    }
  }

  return { tag }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
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

      reject(
        new Error(
          `${command} ${args.join(' ')} failed with exit code ${code ?? 'unknown'}\n${stdout}\n${stderr}`,
        ),
      )
    })
  })
}

async function verifyFixture(workspaceRoot, fixture, tag) {
  const workingDir = path.join(workspaceRoot, fixture.name)
  await cp(path.join(fixturesRoot, fixture.name), workingDir, { recursive: true })

  const firstRun = await runCommand(
    'pnpm',
    ['dlx', `@woon-ui/cli@${tag}`, 'add', 'dialog', 'toast'],
    workingDir,
  )
  const secondRun = await runCommand(
    'pnpm',
    ['dlx', `@woon-ui/cli@${tag}`, 'add', 'dialog', 'toast'],
    workingDir,
  )

  const config = JSON.parse(await readFile(path.join(workingDir, 'woon.json'), 'utf8'))
  const packageJson = JSON.parse(await readFile(path.join(workingDir, 'package.json'), 'utf8'))
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
  assert.ok(packageJson.dependencies['@woon-ui/dialog'])
  assert.ok(packageJson.dependencies['@woon-ui/toast'])
  assert.match(firstRun.stdout, /Created:/)
  assert.match(firstRun.stdout, /- woon\.json/)
  assert.match(firstRun.stdout, /Installing @woon-ui\/dialog, @woon-ui\/toast\.\.\./)
  assert.match(firstRun.stdout, /Added dialog, toast/)
  assert.match(
    firstRun.stdout,
    new RegExp(`Local UI path: ${escapeRegExp(fixture.expectedUiPath)}`),
  )
  assert.match(
    firstRun.stdout,
    new RegExp(`Mount DialogRuntime once in ${escapeRegExp(fixture.expectedRuntimeFile)}`),
  )
  assert.match(
    firstRun.stdout,
    new RegExp(
      `Mount Toaster with Toast from '${escapeRegExp(fixture.expectedToastImport)}' once in ${escapeRegExp(fixture.expectedRuntimeFile)}`,
    ),
  )
  assert.match(firstRun.stdout, /https:\/\/woon-ui\.vercel\.app\/docs\/installation/)
  assert.match(firstRun.stdout, /https:\/\/woon-ui\.vercel\.app\/docs\/components\/dialog/)
  assert.match(firstRun.stdout, /https:\/\/woon-ui\.vercel\.app\/docs\/components\/toast/)
  assert.doesNotMatch(firstRun.stdout, /import \{ Toast \} from/)
  assert.match(secondRun.stdout, /Kept existing:/)
  assert.match(secondRun.stdout, /Using existing @woon-ui\/dialog/)
  assert.match(secondRun.stdout, /Using existing @woon-ui\/toast/)
  assert.match(secondRun.stdout, /src\/woon\/ui\/dialog\.tsx/)
  assert.match(secondRun.stdout, /src\/woon\/ui\/toast\.tsx/)
  assert.match(uiIndex, /export \* from '\.\/dialog'/)
  assert.match(uiIndex, /export \* from '\.\/toast'/)
  assert.match(dialogFile, /import '\.\/dialog\.css'/)
  assert.match(toastFile, /import '\.\/toast\.css'/)

  console.log(`PASS ${fixture.name}`)
}

async function main() {
  const { tag } = parseArgs(process.argv.slice(2))
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'woon-cli-published-fixtures-'))

  try {
    for (const fixture of fixtures) {
      await verifyFixture(tmpRoot, fixture, tag)
    }
  } finally {
    await rm(tmpRoot, { recursive: true, force: true })
  }
}

await main()
