# @woon-ui/react

Convenience umbrella package for Woon.
Re-exports component packages from a single entry and provides the bundled `@woon-ui/react/css` import.

For new apps, prefer feature packages such as `@woon-ui/dialog` and `@woon-ui/toast`.
Use `@woon-ui/react` when a single dependency and CSS bundle is more convenient than explicit package-level imports.

## Installation

```bash
pnpm add @woon-ui/react
```

## Usage

```tsx
import { Dialog, DialogRuntime, Toaster } from '@woon-ui/react'
import '@woon-ui/react/css'
```

## Documentation

- Getting started: [woon-ui.vercel.app/docs](https://woon-ui.vercel.app/docs)
- Installation: [woon-ui.vercel.app/docs/installation](https://woon-ui.vercel.app/docs/installation)
- Runtime Setup: [woon-ui.vercel.app/docs/runtime-setup](https://woon-ui.vercel.app/docs/runtime-setup)
