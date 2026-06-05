#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../.env"

if [ -z "$VERSION" ]; then
  echo "Usage: VERSION=1.0.7 make rerelease"
  exit 1
fi

cd "$SCRIPT_DIR/.."

echo "→ Deleting tag v$VERSION locally and remotely..."
git tag -d "v$VERSION" 2>/dev/null || true
git push origin ":refs/tags/v$VERSION" 2>/dev/null || true

echo "→ Deleting GitHub Release v$VERSION..."
gh release delete "v$VERSION" --yes 2>/dev/null || true

echo "→ Re-releasing v$VERSION..."
bash "$SCRIPT_DIR/release.sh"
