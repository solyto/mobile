#!/usr/bin/env bash
# Refresh vendored frontend (mobile/frontend) from canonical app source (../app) + mobile patches.
# Run at release time, then commit mobile/frontend.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
APP_SRC="${APP_SRC:-$ROOT/../app}"
DEST="$ROOT/frontend"

echo "→ Vendoring frontend from $APP_SRC ..."
rsync -a --delete \
  --exclude='.git' --exclude='node_modules' --exclude='build' \
  --exclude='.svelte-kit' --exclude='.idea' \
  "$APP_SRC/" "$DEST/"

echo "→ Applying mobile patches ..."
cp "$ROOT/patch/svelte.config.js" "$DEST/svelte.config.js"
cp "$ROOT/patch/package.json"     "$DEST/package.json"
cp "$ROOT/patch/layout.svelte"    "$DEST/src/routes/+layout.svelte"

rm -f "$DEST/package-lock.json"   # package.json was replaced; build uses npm install
echo "✓ Vendored into $DEST — review and commit."
