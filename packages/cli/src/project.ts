import { spawn } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { readJsonFile } from './json'
import type { Framework, PackageManager, WoonConfig } from './types'

const SCHEMA_URL = 'https://woon-ui.dev/schema.json'
const CONFIG_FILES = ['woon.json'] as const

interface PackageJsonShape {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
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

async function createConfig(projectRoot: string): Promise<WoonConfig> {
  const sourceRoot = await detectSourceRoot(projectRoot)

  return {
    $schema: SCHEMA_URL,
    framework: await detectFramework(projectRoot),
    packageManager: await detectPackageManager(projectRoot),
    paths: {
      overlay: toPosixPath(
        sourceRoot ? path.join(sourceRoot, 'woon', 'overlay') : path.join('woon', 'overlay'),
      ),
    },
    adapters: {
      overlay: 'base-ui',
    },
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

export async function ensureIndexExport(
  projectRoot: string,
  targetDir: string,
  exportName: string,
): Promise<'created' | 'updated' | 'skipped'> {
  const indexPath = path.join(projectRoot, targetDir, 'index.ts')
  const exportLine = `export * from './${exportName}'`

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
