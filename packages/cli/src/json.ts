import { readFile } from 'node:fs/promises'

function stripJsonComments(input: string): string {
  let output = ''
  let inString = false
  let escaped = false

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const next = input[index + 1]

    if (escaped) {
      output += char
      escaped = false
      continue
    }

    if (char === '\\') {
      output += char
      escaped = true
      continue
    }

    if (char === '"') {
      output += char
      inString = !inString
      continue
    }

    if (!inString && char === '/' && next === '/') {
      while (index < input.length && input[index] !== '\n') {
        index += 1
      }
      output += '\n'
      continue
    }

    if (!inString && char === '/' && next === '*') {
      index += 2
      while (index < input.length && !(input[index] === '*' && input[index + 1] === '/')) {
        index += 1
      }
      index += 1
      continue
    }

    output += char
  }

  return output
}

function stripTrailingCommas(input: string): string {
  return input.replace(/,\s*([}\]])/g, '$1')
}

export function parseJson<T>(input: string): T {
  const normalized = stripTrailingCommas(stripJsonComments(input))
  return JSON.parse(normalized) as T
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf8')
  return parseJson<T>(content)
}
