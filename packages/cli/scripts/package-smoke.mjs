import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const cliRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: 'true' },
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

async function pathExists(targetPath) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'woon-cli-package-'))
  const packDirectory = path.join(temporaryRoot, 'pack')
  const fixtureDirectory = path.join(temporaryRoot, 'fixture')

  try {
    await mkdir(packDirectory, { recursive: true })
    await mkdir(path.join(fixtureDirectory, 'src'), { recursive: true })
    await writeFile(
      path.join(fixtureDirectory, 'package.json'),
      `${JSON.stringify({ name: 'woon-cli-package-fixture', private: true }, null, 2)}\n`,
    )

    await runCommand(pnpmCommand, ['pack', '--pack-destination', packDirectory], cliRoot)

    const tarballs = (await readdir(packDirectory)).filter((fileName) => fileName.endsWith('.tgz'))
    assert.equal(tarballs.length, 1, '배포 tarball이 정확히 하나 생성되어야 합니다.')

    const tarballPath = path.join(packDirectory, tarballs[0])
    await runCommand(
      pnpmCommand,
      ['add', '--offline', '--ignore-scripts', '--save-exact', tarballPath],
      fixtureDirectory,
    )

    const installedCliRoot = path.join(fixtureDirectory, 'node_modules/@woon-ui/cli')
    const installedPackage = JSON.parse(
      await readFile(path.join(installedCliRoot, 'package.json'), 'utf8'),
    )
    assert.deepEqual(installedPackage.bin, { woon: './dist/bin.js' })
    assert.equal(await pathExists(path.join(installedCliRoot, 'dist/bin.js')), true)
    assert.equal(
      await pathExists(path.join(installedCliRoot, 'src')),
      false,
      '배포물에는 소스 디렉터리가 포함되지 않아야 합니다.',
    )

    const help = await runCommand(pnpmCommand, ['exec', 'woon', '--help'], fixtureDirectory)
    assert.match(help.stdout, /woon add overlay/)

    const add = await runCommand(
      pnpmCommand,
      ['exec', 'woon', 'add', 'overlay', '--skip-install'],
      fixtureDirectory,
    )
    assert.match(add.stdout, /Added overlay/)
    assert.match(add.stdout, /Skipping install for @woon-ui\/core, @base-ui\/react/)

    const overlayDirectory = path.join(fixtureDirectory, 'src/woon/overlay')
    await Promise.all(
      ['alert.tsx', 'confirm.tsx', 'overlay-provider.tsx', 'overlay.css', 'index.ts'].map(
        (fileName) => access(path.join(overlayDirectory, fileName)),
      ),
    )

    const config = JSON.parse(await readFile(path.join(fixtureDirectory, 'woon.json'), 'utf8'))
    assert.equal(config.framework, 'unknown')
    assert.equal(config.paths.overlay, 'src/woon/overlay')
    assert.equal(config.adapters.overlay, 'base-ui')

    console.log('PASS packaged woon CLI')
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
}

await main()
