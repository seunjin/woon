import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  ensureConfig,
  ensureDirectory,
  ensureIndexExport,
  findProjectRoot,
  fromProjectPath,
  installDependencies,
  isDependencyInstalled,
  pathExists,
  toPosixPath,
} from './project'
import { getOverlayScaffoldFiles } from './templates'
import type { WoonConfig } from './types'

interface ParsedArgs {
  positionals: string[]
  cwd: string
  help: boolean
  skipInstall: boolean
  verbose: boolean
}

interface RuntimeTarget {
  appRootFile: string | null
  importPath: string
}

interface RuntimeSnippet {
  title: string
  targetFile: string
  snippet: string
}

const DOCS_BASE_URL = 'https://woon-ui.vercel.app'

function printHelp(): void {
  console.log(`Woon CLI

Usage:
  woon init [--cwd <path>]
  woon add overlay [--cwd <path>] [--verbose]

Examples:
  pnpm dlx @woon-ui/cli add overlay
  pnpm dlx @woon-ui/cli init
`)
}

function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = []
  let cwd = process.cwd()
  let help = false
  let skipInstall = false
  let verbose = false

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg) {
      continue
    }

    if (arg === '--help' || arg === '-h') {
      help = true
      continue
    }

    if (arg === '--skip-install') {
      skipInstall = true
      continue
    }

    if (arg === '--verbose' || arg === '-v') {
      verbose = true
      continue
    }

    if (arg === '--cwd') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('Missing value for --cwd')
      }
      cwd = path.resolve(value)
      index += 1
      continue
    }

    if (arg.startsWith('--cwd=')) {
      cwd = path.resolve(arg.slice('--cwd='.length))
      continue
    }

    positionals.push(arg)
  }

  return { positionals, cwd, help, skipInstall, verbose }
}

function formatRelativePath(projectRoot: string, filePath: string): string {
  const relative = path.relative(projectRoot, filePath)
  return relative ? toPosixPath(relative) : '.'
}

function getAppRootFile(framework: string, overlayPath: string): string | null {
  if (framework === 'vite-react') {
    return 'src/main.tsx'
  }

  if (framework === 'next-app-router') {
    return overlayPath.startsWith('src/') ? 'src/app/layout.tsx' : 'app/layout.tsx'
  }

  return null
}

function getOverlayPath(config: WoonConfig): string {
  if (!config.paths?.overlay || config.adapters?.overlay !== 'base-ui') {
    throw new Error(
      '기존 woon.json은 vNext와 호환되지 않습니다. 파일을 제거한 뒤 다시 실행해 주세요.',
    )
  }
  return config.paths.overlay
}

function toRelativeImport(fromFile: string, toFile: string): string {
  const fromDir = path.posix.dirname(toPosixPath(fromFile))
  const relative = path.posix.relative(fromDir, toPosixPath(toFile))
  return relative.startsWith('.') ? relative : `./${relative}`
}

function getRuntimeTarget(framework: string, overlayPath: string): RuntimeTarget {
  const appRootFile = getAppRootFile(framework, overlayPath)

  if (!appRootFile) {
    return {
      appRootFile: null,
      importPath: `${overlayPath}/overlay-provider`,
    }
  }

  return {
    appRootFile,
    importPath: toRelativeImport(appRootFile, `${overlayPath}/overlay-provider`),
  }
}

function getOverlayRuntimeSnippet(framework: string, providerImportPath: string): string {
  if (framework === 'vite-react') {
    return `import { AppOverlayProvider } from '${providerImportPath}'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppOverlayProvider>
      <App />
    </AppOverlayProvider>
  </StrictMode>,
)`
  }

  if (framework === 'next-app-router') {
    return `import { AppOverlayProvider } from '${providerImportPath}'

<body>
  <AppOverlayProvider>{children}</AppOverlayProvider>
</body>`
  }

  return `import { AppOverlayProvider } from '${providerImportPath}'

export function AppRoot() {
  return <AppOverlayProvider><App /></AppOverlayProvider>
}`
}

function printList(title: string, items: string[]): void {
  if (items.length === 0) {
    return
  }

  console.log(`\n${title}:`)
  for (const item of items) {
    console.log(`- ${item}`)
  }
}

async function writeScaffoldFile(
  filePath: string,
  content: string,
): Promise<'created' | 'skipped'> {
  if (await pathExists(filePath)) {
    return 'skipped'
  }

  await writeFile(filePath, content, 'utf8')
  return 'created'
}

async function runInit(cwd: string): Promise<number> {
  const projectRoot = await findProjectRoot(cwd)
  const { config, configPath, created } = await ensureConfig(projectRoot)
  await ensureDirectory(fromProjectPath(projectRoot, getOverlayPath(config)))

  if (created) {
    console.log(`Created ${formatRelativePath(projectRoot, configPath)}`)
  } else {
    console.log(`Using existing ${formatRelativePath(projectRoot, configPath)}`)
  }

  console.log(`Framework: ${config.framework}`)
  console.log(`Package manager: ${config.packageManager}`)
  console.log(`Overlay path: ${getOverlayPath(config)}`)

  return 0
}

async function runAdd(
  features: string[],
  cwd: string,
  skipInstall: boolean,
  verbose: boolean,
): Promise<number> {
  if (features.length !== 1 || features[0] !== 'overlay') {
    throw new Error('The vNext CLI only supports: woon add overlay')
  }

  const projectRoot = await findProjectRoot(cwd)
  const { config, configPath, created } = await ensureConfig(projectRoot)
  const overlayPath = getOverlayPath(config)
  const overlayDir = fromProjectPath(projectRoot, overlayPath)
  const indexFilePath = toPosixPath(path.join(overlayPath, 'index.ts'))

  const createdPaths: string[] = []
  const skippedPaths: string[] = []
  const updatedPaths = new Set<string>()
  const nextSteps: string[] = []
  const docs = [`${DOCS_BASE_URL}/docs/installation`]
  const runtimeSnippets: RuntimeSnippet[] = []

  if (created) {
    createdPaths.push(formatRelativePath(projectRoot, configPath))
  }

  await ensureDirectory(overlayDir)

  const missingPackages: string[] = []
  for (const packageName of ['@woon-ui/core', '@base-ui/react']) {
    if (await isDependencyInstalled(projectRoot, packageName)) {
      console.log(`Using existing ${packageName}`)
    } else {
      missingPackages.push(packageName)
    }
  }

  if (missingPackages.length > 0) {
    if (skipInstall) {
      console.log(`Skipping install for ${missingPackages.join(', ')}`)
    } else {
      console.log(`Installing ${missingPackages.join(', ')}...`)
      await installDependencies(projectRoot, config.packageManager, missingPackages)
    }
  }

  docs.push(`${DOCS_BASE_URL}/docs/components/overlay`)
  for (const file of getOverlayScaffoldFiles()) {
    const targetPath = path.join(overlayDir, file.name)
    const result = await writeScaffoldFile(targetPath, file.content)
    const formattedPath = formatRelativePath(projectRoot, targetPath)
    if (result === 'created') {
      createdPaths.push(formattedPath)
    } else {
      skippedPaths.push(formattedPath)
    }
  }

  for (const exportName of ['alert', 'confirm', 'overlay-provider']) {
    const indexStatus = await ensureIndexExport(projectRoot, overlayPath, exportName)
    if (indexStatus !== 'skipped') {
      updatedPaths.add(indexFilePath)
    }
  }

  const runtimeTarget = getRuntimeTarget(config.framework, overlayPath)
  nextSteps.push(
    `Mount AppOverlayProvider from '${runtimeTarget.importPath}' once in ${runtimeTarget.appRootFile ?? 'your app root'}`,
  )

  if (verbose) {
    runtimeSnippets.push({
      title: 'Overlay runtime',
      targetFile: runtimeTarget.appRootFile ?? 'your app root',
      snippet: getOverlayRuntimeSnippet(config.framework, runtimeTarget.importPath),
    })
  }

  console.log('\nAdded overlay')
  console.log(`Local overlay path: ${overlayPath}`)

  if (createdPaths.length > 0) {
    printList('Created', createdPaths)
  }

  if (updatedPaths.size > 0) {
    printList('Updated', [...updatedPaths])
  }

  if (createdPaths.length === 0 && updatedPaths.size === 0) {
    console.log('\nNo new files were created.')
  }

  if (skippedPaths.length > 0) {
    printList('Kept existing', skippedPaths)
  }

  if (nextSteps.length > 0) {
    printList('Next step', [...new Set(nextSteps)])
  }

  printList('Docs', [...new Set(docs)])

  if (runtimeSnippets.length > 0) {
    console.log('\nRuntime snippets:')
    for (const runtimeSnippet of runtimeSnippets) {
      console.log(`\n${runtimeSnippet.title} (${runtimeSnippet.targetFile}):\n`)
      console.log(runtimeSnippet.snippet)
    }
  } else if (nextSteps.length > 0) {
    console.log('\nTip:')
    console.log('- Run the same command with --verbose to print the full runtime snippets')
  }

  return 0
}

export async function run(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv)

  if (parsed.help || parsed.positionals.length === 0) {
    printHelp()
    return 0
  }

  const [command, ...rest] = parsed.positionals

  if (command === 'init') {
    return runInit(parsed.cwd)
  }

  if (command === 'add') {
    return runAdd(rest, parsed.cwd, parsed.skipInstall, parsed.verbose)
  }

  throw new Error(`Unknown command "${command}"`)
}
