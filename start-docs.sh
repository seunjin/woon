#!/bin/bash

export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")"

echo "Woon 문서 사이트 시작 중..."
echo "http://localhost:3000 에서 확인하세요"
echo ""

pnpm dev:docs
