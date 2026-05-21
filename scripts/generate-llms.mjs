#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptPath = fileURLToPath(import.meta.url)
const rootDir = path.resolve(path.dirname(scriptPath), '..')
const docsDir = path.join(rootDir, 'apps/docs')
const publicDir = path.join(docsDir, 'public')
const configPath = path.join(docsDir, 'llms.config.mjs')
const componentDocsDir = path.join(docsDir, 'app/docs/components')

const config = (await import(pathToFileURL(configPath).href)).default

validateConfig(config)

mkdirSync(publicDir, { recursive: true })

const llmsText = renderLlmsTxt(config)
const llmsFullText = renderLlmsFullTxt(config)

writeFileSync(path.join(publicDir, 'llms.txt'), llmsText)
writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFullText)

console.log('Generated apps/docs/public/llms.txt')
console.log('Generated apps/docs/public/llms-full.txt')

function validateConfig(config) {
  const errors = []

  if (!config?.baseUrl) errors.push('Missing baseUrl')
  if (!config?.library?.name) errors.push('Missing library.name')
  if (!Array.isArray(config?.docsLinks)) errors.push('Missing docsLinks array')
  if (!Array.isArray(config?.components)) errors.push('Missing components array')

  if (errors.length > 0) fail(errors)

  const ids = new Set()
  const docsPaths = new Set()

  for (const link of config.docsLinks) {
    const prefix = link.label ? `Docs link "${link.label}"` : 'Docs link'

    for (const field of ['label', 'path', 'description']) {
      if (!link[field]) errors.push(`${prefix} is missing ${field}`)
    }

    if (link.path) {
      const contentPath = docsPathToContentPath(link.path)
      if (!existsSync(contentPath)) {
        errors.push(`${prefix} path has no content.mdx: ${link.path}`)
      }
    }
  }

  for (const component of config.components) {
    const prefix = component.id ? `Component "${component.id}"` : 'Component'

    for (const field of [
      'id',
      'name',
      'packageName',
      'docsPath',
      'cliCommand',
      'cssImport',
      'runtime',
      'when',
      'avoid',
      'example',
    ]) {
      if (!component[field]) errors.push(`${prefix} is missing ${field}`)
    }

    if (!Array.isArray(component.imports) || component.imports.length === 0) {
      errors.push(`${prefix} is missing imports`)
    }

    if (component.id) {
      if (ids.has(component.id)) errors.push(`Duplicate component id: ${component.id}`)
      ids.add(component.id)
    }

    if (component.docsPath) {
      if (docsPaths.has(component.docsPath))
        errors.push(`Duplicate docsPath: ${component.docsPath}`)
      docsPaths.add(component.docsPath)

      if (!component.docsPath.startsWith('/docs/components/')) {
        errors.push(`${prefix} docsPath must start with /docs/components/`)
      }

      const contentPath = docsPathToContentPath(component.docsPath)
      if (!existsSync(contentPath)) {
        errors.push(`${prefix} docsPath has no content.mdx: ${component.docsPath}`)
      }
    }
  }

  for (const contentPath of listContentFiles(componentDocsDir)) {
    const docsPath = contentPathToDocsPath(contentPath)
    if (!docsPaths.has(docsPath)) {
      errors.push(`Component docs page is missing from llms.config.mjs: ${docsPath}`)
    }
  }

  if (errors.length > 0) fail(errors)
}

function fail(errors) {
  console.error('Failed to generate llms files:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

function listContentFiles(dir) {
  const files = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...listContentFiles(entryPath))
      continue
    }

    if (entry.name === 'content.mdx') {
      files.push(entryPath)
    }
  }

  return files.sort()
}

function docsPathToContentPath(docsPath) {
  return path.join(docsDir, 'app', trimSlashes(docsPath), 'content.mdx')
}

function contentPathToDocsPath(contentPath) {
  const relative = path.relative(path.join(docsDir, 'app'), path.dirname(contentPath))
  return `/${relative.split(path.sep).join('/')}`
}

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '')
}

function renderLlmsTxt(config) {
  const lines = [
    `# ${config.library.name}`,
    '',
    `> ${config.library.tagline}`,
    '',
    config.library.description,
    '',
    'This file is for AI assistants. Use it as a short index, then read the full context when generating code.',
    '',
    '## Full Context',
    '',
    `- [llms-full.txt](${absoluteUrl(config, '/llms-full.txt')}): complete AI usage rules, package map, runtime notes, and code examples.`,
    '',
    '## Core Rules',
    '',
    '- Woon solves interaction behavior: focus trapping, focus restoration, anchored positioning, ARIA, keyboard navigation, overlay stacking, and imperative APIs.',
    '- Woon does not provide visual design-system components such as buttons, inputs, badges, or cards.',
    '- Prefer the CLI flow for app integration: `pnpm dlx @woon-ui/cli add dialog toast popover`.',
    '- React 19 and react-dom 19 are required peer dependencies.',
    '',
    '## Start Here',
    '',
    ...config.docsLinks.map(
      (link) => `- [${link.label}](${absoluteUrl(config, link.path)}): ${link.description}`,
    ),
    '',
    '## Components',
    '',
    ...config.components.map(
      (component) =>
        `- [${component.name}](${absoluteUrl(config, component.docsPath)}): ${component.when} Package: \`${component.packageName}\`.`,
    ),
    '',
  ]

  return withGeneratedHeader(lines.join('\n'))
}

function renderLlmsFullTxt(config) {
  const lines = [
    `# ${config.library.name} Full AI Context`,
    '',
    `> ${config.library.tagline}`,
    '',
    config.library.description,
    '',
    '## AI Usage Rules',
    '',
    ...config.aiRules.map((rule) => `- ${rule}`),
    '',
    '## Install And Runtime Defaults',
    '',
    '- Preferred install flow: `pnpm dlx @woon-ui/cli add dialog toast popover`.',
    '- The CLI creates user-owned local UI wrappers under the configured Woon UI path and keeps Woon behavior in package imports.',
    '- Manual install is also valid: install feature packages directly, then import each package CSS entry.',
    '- Use `@woon-ui/react` only when a single convenience aggregate is useful; feature packages remain the clearest default.',
    '- Mount `<DialogRuntime />` once for `useDialog()`, `alert()`, and `confirm()`.',
    '- Mount `<Toaster />` once for `toast()`.',
    '- Tooltip, Popover, Dropdown Menu, Context Menu, Select, and Combobox do not require a root runtime mount.',
    '',
    '```tsx',
    "import { DialogRuntime } from '@woon-ui/dialog'",
    "import { Toaster } from '@woon-ui/toast'",
    "import { Toast } from '@/woon/ui/toast'",
    '',
    'export function Providers({ children }: { children: React.ReactNode }) {',
    '  return (',
    '    <>',
    '      {children}',
    '      <DialogRuntime />',
    '      <Toaster position="bottom-right" render={Toast} />',
    '    </>',
    '  )',
    '}',
    '```',
    '',
    '## Styling Boundary',
    '',
    '- Import Woon CSS for behavior-safe baseline selectors and animations, then override with app-owned CSS.',
    '- Generated local wrappers and local CSS are owned by the application, not by Woon.',
    '- Do not present docs-site components as app integration code. `DemoBox`, `Callout`, `PackageManagerTabs`, `PropsTable`, `PartsTable`, and `CodeTabs` are documentation UI only.',
    '',
    '## Component Registry',
    '',
    ...config.components.flatMap((component) => renderComponentSection(config, component)),
    '',
  ]

  return withGeneratedHeader(lines.join('\n'))
}

function renderComponentSection(config, component) {
  return [
    `### ${component.name}`,
    '',
    `- Package: \`${component.packageName}\``,
    `- Docs: [${component.docsPath}](${absoluteUrl(config, component.docsPath)})`,
    `- CLI: \`${component.cliCommand}\``,
    `- CSS: \`${component.cssImport}\``,
    `- Imports: ${component.imports.map((name) => `\`${name}\``).join(', ')}`,
    `- Runtime: ${component.runtime}`,
    `- Use when: ${component.when}`,
    `- Avoid when: ${component.avoid}`,
    '',
    '```tsx',
    component.example,
    '```',
    '',
  ]
}

function withGeneratedHeader(content) {
  return [
    '<!-- This file is generated by scripts/generate-llms.mjs. Do not edit directly. -->',
    '',
    content.trimEnd(),
    '',
  ].join('\n')
}

function absoluteUrl(config, pathname) {
  return `${config.baseUrl.replace(/\/+$/, '')}/${trimSlashes(pathname)}`
}
