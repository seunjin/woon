import { spawn } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { readJsonFile } from './json'
import type { Framework, PackageManager, WoonConfig } from './types'

const SCHEMA_URL = 'https://woon-ui.dev/schema.json'
const CONFIG_FILES = ['woon.json', 'woon-ui.json'] as const

interface PackageJsonShape {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface TsConfigShape {
  compilerOptions?: {
    paths?: Record<string, string[]>
  }
}

export interface LoadedConfig {
  config: WoonConfig
  configPath: string
  created: boolean
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

export async function findProjectRoot(startDir: string): Promise<string> {
  let currentDir = path.resolve(startDir)

  while (true) {
    if (await pathExists(path.join(currentDir, 'package.json'))) {
      return currentDir
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      throw new Error(`Could not find a package.json above ${startDir}`)
    }
    currentDir = parentDir
  }
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true })
}

export function toPosixPath(value: string): string {
  return value.split(path.sep).join(path.posix.sep)
}

export function fromProjectPath(projectRoot: string, projectPath: string): string {
  return path.join(projectRoot, projectPath)
}

export async function findExistingConfigPath(projectRoot: string): Promise<string | null> {
  for (const fileName of CONFIG_FILES) {
    const candidate = path.join(projectRoot, fileName)
    if (await pathExists(candidate)) {
      return candidate
    }
  }

  return null
}

async function readPackageJson(projectRoot: string): Promise<PackageJsonShape> {
  return readJsonFile<PackageJsonShape>(path.join(projectRoot, 'package.json'))
}

async function detectPackageManager(projectRoot: string): Promise<PackageManager> {
  const candidates: Array<[string, PackageManager]> = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['package-lock.json', 'npm'],
    ['yarn.lock', 'yarn'],
    ['bun.lockb', 'bun'],
    ['bun.lock', 'bun'],
  ]

  for (const [fileName, packageManager] of candidates) {
    if (await pathExists(path.join(projectRoot, fileName))) {
      return packageManager
    }
  }

  return 'pnpm'
}

async function detectFramework(projectRoot: string): Promise<Framework> {
  const packageJson = await readPackageJson(projectRoot)
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }

  const hasNext = Boolean(dependencies.next)
  const hasVite = Boolean(dependencies.vite)

  if (
    hasNext &&
    ((await pathExists(path.join(projectRoot, 'app'))) ||
      (await pathExists(path.join(projectRoot, 'src', 'app'))))
  ) {
    return 'next-app-router'
  }

  if (
    hasVite &&
    ((await pathExists(path.join(projectRoot, 'src', 'main.tsx'))) ||
      (await pathExists(path.join(projectRoot, 'src', 'main.jsx'))))
  ) {
    return 'vite-react'
  }

  return 'unknown'
}

async function detectSourceRoot(projectRoot: string): Promise<string> {
  const srcDir = path.join(projectRoot, 'src')
  return (await pathExists(srcDir)) ? 'src' : ''
}

async function readAliasConfig(projectRoot: string): Promise<TsConfigShape | null> {
  const candidates = ['tsconfig.json', 'jsconfig.json']

  for (const fileName of candidates) {
    const candidate = path.join(projectRoot, fileName)
    if (await pathExists(candidate)) {
      return readJsonFile<TsConfigShape>(candidate)
    }
  }

  return null
}

function normalizeAliasTarget(target: string): string {
  return target.replace(/\/\*$/, '').replace(/^\.\//, '')
}

function normalizeAliasPattern(pattern: string): string {
  return pattern.replace(/\/\*$/, '/')
}

async function detectAliases(
  projectRoot: string,
  sourceRoot: string,
): Promise<WoonConfig['aliases']> {
  const tsConfig = await readAliasConfig(projectRoot)
  const paths = tsConfig?.compilerOptions?.paths

  if (!paths) {
    return {}
  }

  const expectedRoot = sourceRoot

  for (const [pattern, values] of Object.entries(paths)) {
    const firstValue = values[0]
    if (!firstValue) continue

    const normalizedTarget = normalizeAliasTarget(firstValue)
    const targetFromRoot = normalizedTarget === '.' ? '' : normalizedTarget

    if (targetFromRoot !== expectedRoot) {
      continue
    }

    const aliasRoot = normalizeAliasPattern(pattern)

    const joinAlias = (segment: string) => {
      const trimmedSegment = segment.replace(/^[./]+/, '')
      return `${aliasRoot}${trimmedSegment}`
    }

    return {
      ui: joinAlias('woon/ui'),
      hooks: joinAlias('woon/hooks'),
      lib: joinAlias('woon/lib'),
    }
  }

  return {}
}

function getDefaultPaths(sourceRoot: string): WoonConfig['paths'] {
  const withSourceRoot = (...segments: string[]) =>
    toPosixPath(sourceRoot ? path.join(sourceRoot, ...segments) : path.join(...segments))

  return {
    ui: withSourceRoot('woon', 'ui'),
    hooks: withSourceRoot('woon', 'hooks'),
    lib: withSourceRoot('woon', 'lib'),
  }
}

async function createConfig(projectRoot: string): Promise<WoonConfig> {
  const sourceRoot = await detectSourceRoot(projectRoot)

  return {
    $schema: SCHEMA_URL,
    framework: await detectFramework(projectRoot),
    packageManager: await detectPackageManager(projectRoot),
    paths: getDefaultPaths(sourceRoot),
    aliases: await detectAliases(projectRoot, sourceRoot),
    style: 'colocated-css',
  }
}

export async function ensureConfig(projectRoot: string): Promise<LoadedConfig> {
  const existingConfigPath = await findExistingConfigPath(projectRoot)

  if (existingConfigPath) {
    return {
      config: await readJsonFile<WoonConfig>(existingConfigPath),
      configPath: existingConfigPath,
      created: false,
    }
  }

  const configPath = path.join(projectRoot, 'woon.json')
  const config = await createConfig(projectRoot)

  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')

  return { config, configPath, created: true }
}

export async function ensureUiIndexFile(
  projectRoot: string,
  uiDir: string,
  featureName: string,
): Promise<'created' | 'updated' | 'skipped'> {
  const indexPath = path.join(projectRoot, uiDir, 'index.ts')
  const exportLine = `export * from './${featureName}'`

  if (!(await pathExists(indexPath))) {
    await writeFile(indexPath, `${exportLine}\n`, 'utf8')
    return 'created'
  }

  const currentContent = await readFile(indexPath, 'utf8')
  if (currentContent.includes(exportLine)) {
    return 'skipped'
  }

  const nextContent = currentContent.trimEnd()
    ? `${currentContent.trimEnd()}\n${exportLine}\n`
    : `${exportLine}\n`
  await writeFile(indexPath, nextContent, 'utf8')
  return 'updated'
}

export async function isDependencyInstalled(
  projectRoot: string,
  packageName: string,
): Promise<boolean> {
  const packageJson = await readPackageJson(projectRoot)
  const fields = [packageJson.dependencies, packageJson.devDependencies]

  return fields.some((field) => Boolean(field?.[packageName]))
}

export async function installDependencies(
  projectRoot: string,
  packageManager: PackageManager,
  packageNames: string[],
): Promise<void> {
  if (packageNames.length === 0) {
    return
  }

  const commandMap: Record<PackageManager, [string, ...string[]]> = {
    pnpm: ['pnpm', 'add', ...packageNames],
    npm: ['npm', 'install', ...packageNames],
    yarn: ['yarn', 'add', ...packageNames],
    bun: ['bun', 'add', ...packageNames],
  }

  const [command, ...args] = commandMap[packageManager]

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code ?? 'unknown'}`))
    })
  })
}
