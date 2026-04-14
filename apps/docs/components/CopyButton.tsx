'use client'

import { useState } from 'react'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      type="button"
      className={`copy-btn${copied ? ' copy-btn--copied' : ''}`}
      aria-label={copied ? '복사됨' : '코드 복사'}
      onClick={handleCopy}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  )
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="4.5" y="0.5" width="8" height="8" rx="1.5" stroke="currentColor" />
      <path
        d="M0.5 4.5V12.5H8.5V9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M2 6.5L5 9.5L11 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
