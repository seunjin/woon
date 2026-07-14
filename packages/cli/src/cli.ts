import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import { FEATURE_NAMES, getFeature } from './features'
import {
  ensureConfig,
  ensureDirectory,
  ensureUiIndexFile,
  findProjectRoot,
  fromProjectPath,
  installDependencies,
  isDependencyInstalled,
  pathExists,
  toPosixPath,
} from './project'
import { getScaffoldFiles } from './templates'

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
  woon add <feature...> [--cwd <path>] [--verbose]

Examples:
  pnpm dlx @woon-ui/cli init
  pnpm dlx @woon-ui/cli add dialog
  pnpm dlx @woon-ui/cli add dialog toast
  pnpm dlx @woon-ui/cli add dialog toast --verbose

Available features:
  ${FEATURE_NAMES.join(', ')}
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

function getAppRootFile(framework: string, uiPath: string): string | null {
  if (framework === 'vite-react') {
    return 'src/main.tsx'
  }

  if (framework === 'next-app-router') {
    return uiPath.startsWith('src/') ? 'src/app/layout.tsx' : 'app/layout.tsx'
  }

  return null
}

function toRelativeImport(fromFile: string, toFile: string): string {
  const fromDir = path.posix.dirname(toPosixPath(fromFile))
  const relative = path.posix.relative(fromDir, toPosixPath(toFile))
  return relative.startsWith('.') ? relative : `./${relative}`
}

function getRuntimeTarget(
  framework: string,
  uiPath: string,
  alias: string | undefined,
  featureName: string,
): RuntimeTarget {
  if (alias) {
    return {
      appRootFile: getAppRootFile(framework, uiPath),
      importPath: `${alias.replace(/\/$/, '')}/${featureName}`,
    }
  }

  const appRootFile = getAppRootFile(framework, uiPath)

  if (!appRootFile) {
    return {
      appRootFile: null,
      importPath: `${uiPath}/${featureName}`,
    }
  }

  return {
    appRootFile,
    importPath: toRelativeImport(appRootFile, `${uiPath}/${featureName}`),
  }
}

function getDialogRuntimeSnippet(framework: string): string {
  if (framework === 'vite-react') {
    return `import { DialogRuntime } from '@woon-ui/dialog'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <App />
      <DialogRuntime />
    </>
  </StrictMode>,
)`
  }

  if (framework === 'next-app-router') {
    return `import { DialogRuntime } from '@woon-ui/dialog'

<body>
  {children}
  <DialogRuntime />
</body>`
  }

  return `import { DialogRuntime } from '@woon-ui/dialog'

export function AppRoot() {
  return (
    <>
      <App />
      <DialogRuntime />
    </>
  )
}`
}

function getToastRuntimeSnippet(framework: string, toastImportPath: string): string {
  if (framework === 'vite-react') {
    return `import { Toaster } from '@woon-ui/toast'
import { Toast } from '${toastImportPath}'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <App />
      <Toaster position="bottom-right" render={Toast} />
    </>
  </StrictMode>,
)`
  }

  if (framework === 'next-app-router') {
    return `import { Toaster } from '@woon-ui/toast'
import { Toast } from '${toastImportPath}'

<body>
  {children}
  <Toaster position="bottom-right" render={Toast} />
</body>`
  }

  return `import { Toaster } from '@woon-ui/toast'
import { Toast } from '${toastImportPath}'

export function AppRoot() {
  return (
    <>
      <App />
      <Toaster position="bottom-right" render={Toast} />
    </>
  )
}`
}

function getFeatureDocsUrl(featureName: string): string {
  return `${DOCS_BASE_URL}/docs/components/${featureName}`
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
  const directories = [config.paths.ui, config.paths.hooks, config.paths.lib]

  for (const directory of directories) {
    await ensureDirectory(fromProjectPath(projectRoot, directory))
  }

  if (created) {
    console.log(`Created ${formatRelativePath(projectRoot, configPath)}`)
  } else {
    console.log(`Using existing ${formatRelativePath(projectRoot, configPath)}`)
  }

  console.log(`Framework: ${config.framework}`)
  console.log(`Package manager: ${config.packageManager}`)
  console.log(`UI path: ${config.paths.ui}`)

  if (config.aliases.ui) {
    console.log(`UI alias: ${config.aliases.ui}`)
  }

  return 0
}

async function runAdd(
  features: string[],
  cwd: string,
  skipInstall: boolean,
  verbose: boolean,
): Promise<number> {
  if (features.length === 0) {
    throw new Error('Specify at least one feature to add')
  }

  const projectRoot = await findProjectRoot(cwd)
  const { config, configPath, created } = await ensureConfig(projectRoot)
  const uiDir = fromProjectPath(projectRoot, config.paths.ui)
  const indexFilePath = toPosixPath(path.join(config.paths.ui, 'index.ts'))
  const resolvedFeatures = features.map((featureName) => {
    const feature = getFeature(featureName)
    if (!feature) {
      throw new Error(`Unknown feature "${featureName}". Available: ${FEATURE_NAMES.join(', ')}`)
    }

    return feature
  })

  await ensureDirectory(uiDir)

  const createdPaths: string[] = []
  const skippedPaths: string[] = []
  const updatedPaths = new Set<string>()
  const nextSteps: string[] = []
  const docs = [`${DOCS_BASE_URL}/docs/installation`]
  const runtimeSnippets: RuntimeSnippet[] = []

  if (created) {
    await ensureDirectory(fromProjectPath(projectRoot, config.paths.hooks))
    await ensureDirectory(fromProjectPath(projectRoot, config.paths.lib))
    createdPaths.push(formatRelativePath(projectRoot, configPath))
  }

  const missingPackages: string[] = []

  for (const feature of resolvedFeatures) {
    if (await isDependencyInstalled(projectRoot, feature.packageName)) {
      console.log(`Using existing ${feature.packageName}`)
      continue
    }

    if (!missingPackages.includes(feature.packageName)) {
      missingPackages.push(feature.packageName)
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

  for (const feature of resolvedFeatures) {
    docs.push(getFeatureDocsUrl(feature.name))

    for (const file of getScaffoldFiles(feature)) {
      const targetPath = path.join(uiDir, file.name)
      const result = await writeScaffoldFile(targetPath, file.content)
      const formattedPath = formatRelativePath(projectRoot, targetPath)
      if (result === 'created') {
        createdPaths.push(formattedPath)
      } else {
        skippedPaths.push(formattedPath)
      }
    }

    const indexStatus = await ensureUiIndexFile(projectRoot, config.paths.ui, feature.name)
    if (indexStatus !== 'skipped') {
      updatedPaths.add(indexFilePath)
    }

    if (feature.runtime?.importName === 'DialogRuntime') {
      const appRootFile = getAppRootFile(config.framework, config.paths.ui)
      nextSteps.push(`Mount DialogRuntime once in ${appRootFile ?? 'your app root'}`)

      if (verbose) {
        runtimeSnippets.push({
          title: 'Dialog runtime',
          targetFile: appRootFile ?? 'your app root',
          snippet: getDialogRuntimeSnippet(config.framework),
        })
      }
    }

    if (feature.runtime?.importName === 'Toaster') {
      const runtimeTarget = getRuntimeTarget(
        config.framework,
        config.paths.ui,
        config.aliases.ui,
        'toast',
      )
      nextSteps.push(
        `Mount Toaster with Toast from '${runtimeTarget.importPath}' once in ${runtimeTarget.appRootFile ?? 'your app root'}`,
      )

      if (verbose) {
        runtimeSnippets.push({
          title: 'Toast runtime',
          targetFile: runtimeTarget.appRootFile ?? 'your app root',
          snippet: getToastRuntimeSnippet(config.framework, runtimeTarget.importPath),
        })
      }
    }
  }

  console.log(`\nAdded ${resolvedFeatures.map((feature) => feature.name).join(', ')}`)
  console.log(`Local UI path: ${config.paths.ui}`)

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
