#!/usr/bin/env bash
# Build the committed frontend (mobile/frontend) and sync it into the Android project.
# Run by F-Droid (prebuild) and by the GitHub release workflow. No network fetch of app source.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
GRADLE="$ROOT/android/app/build.gradle"

VERSION_NAME=$(node -p "require('$ROOT/package.json').version")
VERSION_CODE=$(echo "$VERSION_NAME" | awk -F. '{ printf "%d%02d%02d", $1, $2, $3 }')

echo "→ Setting version $VERSION_NAME ($VERSION_CODE)..."
sed -i "s/versionCode [0-9]*/versionCode $VERSION_CODE/" "$GRADLE"
sed -i "s/versionName \"[^\"]*\"/versionName \"$VERSION_NAME\"/" "$GRADLE"

echo "→ Building frontend..."
cd "$ROOT/frontend"
npm install
PUBLIC_MOBILE=true PUBLIC_VERSION="$VERSION_NAME" PUBLIC_REDIRECT_AFTER_LOGOUT=/ npm run build

echo "→ Syncing to Capacitor..."
cd "$ROOT"
npm install
npx cap sync android

echo "✓ Done"
