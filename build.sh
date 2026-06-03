#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/../app"
BUILD_DIR="$SCRIPT_DIR/build-src"

echo "→ Syncing app source..."
rsync -a --delete \
  --exclude=".svelte-kit" \
  --exclude="build" \
  --exclude="node_modules" \
  "$SRC_DIR/" "$BUILD_DIR/"

echo "→ Applying mobile patches..."
cp "$SCRIPT_DIR/patch/svelte.config.js" "$BUILD_DIR/svelte.config.js"
cp "$SCRIPT_DIR/patch/package.json" "$BUILD_DIR/package.json"

echo "→ Installing dependencies..."
cd "$BUILD_DIR"
rm -f package-lock.json
npm install

echo "→ Building..."
npm run build

echo "→ Syncing to Capacitor..."
cd "$SCRIPT_DIR"
npx cap sync

echo "✓ Done"
