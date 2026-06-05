#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../.env"

if [ -z "$VERSION" ]; then
  echo "Usage: VERSION=1.0.8 make release"
  exit 1
fi

cd "$SCRIPT_DIR/.."

npm pkg set version="$VERSION"
git add package.json
git diff --cached --quiet || git commit -m "chore: release v$VERSION"
git tag "v$VERSION"
git push origin main "v$VERSION"
