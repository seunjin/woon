#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

claude_files="$(rg --files -uu -g 'CLAUDE.md' -g '!**/node_modules/**')"

if [ -z "$claude_files" ]; then
  echo "No CLAUDE.md files found."
  exit 0
fi

printf '%s\n' "$claude_files" | while IFS= read -r claude_file; do
  agent_file="$(dirname "$claude_file")/AGENTS.md"
  cp "$claude_file" "$agent_file"
  echo "Synced $claude_file -> $agent_file"
done
