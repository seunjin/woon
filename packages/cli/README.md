# @woon-ui/cli

Scaffold local Woon UI files into your configured ui path and install the matching packages.

## Usage

```bash
pnpm dlx @woon-ui/cli add dialog
pnpm dlx @woon-ui/cli add toast
pnpm dlx @woon-ui/cli add dialog toast --verbose
```

The first `add` will create `woon.json` automatically if it does not exist yet.
By default the CLI prints concise next steps and docs links; use `--verbose` to print the full runtime snippets.
