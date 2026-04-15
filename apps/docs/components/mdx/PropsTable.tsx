'use client'

import './ApiTable.css'
import type { ReactNode } from 'react'
import { Fragment } from 'react'

type PropRow = {
  name: string
  type: string
  defaultValue?: string
  description: ReactNode
}

type Props = {
  rows: PropRow[]
}

function renderTypeTokens(value: string) {
  const parts = value.split(/\s+\|\s+/)

  return (
    <span className="docs-props-type-tokens">
      {parts.map((part, index) => (
        <span key={`${value}-${part}`} className="docs-props-type-token-wrap">
          {index > 0 ? <span className="docs-props-type-separator">|</span> : null}
          <span className="docs-props-type-token">{part}</span>
        </span>
      ))}
    </span>
  )
}

export function PropsTable({ rows }: Props) {
  return (
    <div className="docs-api-table-wrap not-prose">
      <table className="docs-api-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Fragment key={row.name}>
              <tr className="docs-api-prop-row">
                <td>
                  <strong>{row.name}</strong>
                </td>
                <td>{renderTypeTokens(row.type)}</td>
                <td>{row.defaultValue ? <code>{row.defaultValue}</code> : '—'}</td>
              </tr>
              <tr className="docs-api-desc-row">
                <td colSpan={3}>{row.description}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
