#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/../app"
BUILD_DIR="$SCRIPT_DIR/build-src"
GRADLE="$SCRIPT_DIR/android/app/build.gradle"

VERSION_NAME=$(node -p "require('$SCRIPT_DIR/package.json').version")
VERSION_CODE=$(echo "$VERSION_NAME" | awk -F. '{ printf "%d%02d%02d", $1, $2, $3 }')

echo "→ Setting version $VERSION_NAME ($VERSION_CODE)..."
sed -i "s/versionCode [0-9]*/versionCode $VERSION_CODE/" "$GRADLE"
sed -i "s/versionName \"[^\"]*\"/versionName \"$VERSION_NAME\"/" "$GRADLE"

echo "→ Syncing app source..."
rsync -a --delete \
  --exclude=".svelte-kit" \
  --exclude="build" \
  --exclude="node_modules" \
  "$SRC_DIR/" "$BUILD_DIR/"

echo "→ Applying mobile patches..."
cp "$SCRIPT_DIR/patch/svelte.config.js" "$BUILD_DIR/svelte.config.js"
cp "$SCRIPT_DIR/patch/package.json" "$BUILD_DIR/package.json"
cp "$SCRIPT_DIR/patch/layout.svelte" "$BUILD_DIR/src/routes/+layout.svelte"

echo "→ Installing dependencies..."
cd "$BUILD_DIR"
rm -f package-lock.json
npm install

echo "→ Building..."
PUBLIC_MOBILE=true PUBLIC_REDIRECT_AFTER_LOGOUT=/ npm run build

echo "→ Syncing to Capacitor..."
cd "$SCRIPT_DIR"
npx cap sync

echo "✓ Done"
