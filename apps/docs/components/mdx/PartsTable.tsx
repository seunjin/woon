import type { ReactNode } from 'react'

type PartRow = {
  name: string
  description: ReactNode
  element?: string
}

type Props = {
  rows: PartRow[]
}

export function PartsTable({ rows }: Props) {
  return (
    <div className="docs-api-table-wrap not-prose">
      <table className="docs-api-table">
        <thead>
          <tr>
            <th>Part</th>
            <th>Description</th>
            <th>Default element</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>{row.description}</td>
              <td>{row.element ? <code>{row.element}</code> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
