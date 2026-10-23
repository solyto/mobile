#!/usr/bin/env bash
# Build a debug APK named "sodevto" (app.sodevto) that installs next to solyto.
# Works on a copy of the Android project in dev/build; android/ is not modified.
set -e

DEV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DEV_DIR/.."
BUILD="$DEV_DIR/build"
PROJECT="$BUILD/android"
GRADLE="$PROJECT/app/build.gradle"
PROD_APP_ID='applicationId "app.solyto"'
DEV_APP_ID='applicationId "app.sodevto"'
APK="$DEV_DIR/sodevto.apk"

VERSION_NAME=$(node -p "require('$ROOT/package.json').version")

echo "→ Building frontend..."
cd "$ROOT/frontend"
npm ci --engine-strict=false
PUBLIC_MOBILE=true PUBLIC_VERSION="$VERSION_NAME-dev" PUBLIC_REDIRECT_AFTER_LOGOUT=/ npm run build

echo "→ Syncing to Capacitor..."
cd "$ROOT"
npm install
npx cap sync android

echo "→ Copying Android project..."
mkdir -p "$BUILD"
rsync -a --delete \
  --exclude='.gradle' --exclude='build' --exclude='.idea' --exclude='local.properties' \
  "$ROOT/android/" "$PROJECT/"
# capacitor.settings.gradle points to ../node_modules.
ln -sfn "$ROOT/node_modules" "$BUILD/node_modules"

echo "→ Renaming to sodevto..."
grep -q "$PROD_APP_ID" "$GRADLE" || { echo "✗ $PROD_APP_ID not found in build.gradle"; exit 1; }
sed -i "s/$PROD_APP_ID/$DEV_APP_ID/" "$GRADLE"
cp "$DEV_DIR/strings.xml" "$PROJECT/app/src/main/res/values/strings.xml"
if [ -f "$ROOT/android/local.properties" ]; then
  cp "$ROOT/android/local.properties" "$PROJECT/local.properties"
fi

echo "→ Building APK..."
cd "$PROJECT"
./gradlew assembleDebug
cp "$PROJECT/app/build/outputs/apk/debug/app-debug.apk" "$APK"

echo "✓ Done: $APK"
