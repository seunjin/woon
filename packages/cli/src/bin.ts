import { run } from './cli'

run(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code
  },
  (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Error: ${message}`)
    process.exitCode = 1
  },
)
