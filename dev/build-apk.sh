#!/usr/bin/env bash
# Build a debug APK named "sodevto" (app.sodevto) that installs next to solyto.
# Everything happens in dev/build: the frontend is synced from ../app (plus the
# mobile patches, as in scripts/vendor.sh), the Android project is copied and
# Capacitor syncs into that copy. mobile/frontend and android/ are not touched.
set -e

DEV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DEV_DIR/.." && pwd)"
APP_SRC="${APP_SRC:-$ROOT/../app}"
BUILD="$DEV_DIR/build"
FRONTEND="$BUILD/frontend"
PROJECT="$BUILD/android"
GRADLE="$PROJECT/app/build.gradle"
PROD_APP_ID='applicationId "app.solyto"'
DEV_APP_ID='applicationId "app.sodevto"'
ADAPTER_STATIC='@sveltejs/adapter-static@3.0.10'
APK="$DEV_DIR/sodevto.apk"

VERSION_NAME=$(node -p "require('$ROOT/package.json').version")

echo "→ Syncing frontend from $APP_SRC ..."
mkdir -p "$BUILD"
rsync -a --delete \
  --exclude='.git' --exclude='node_modules' --exclude='build' \
  --exclude='.svelte-kit' --exclude='.idea' --exclude='.env' \
  "$APP_SRC/" "$FRONTEND/"
cp "$ROOT/patch/svelte.config.js" "$FRONTEND/svelte.config.js"

echo "→ Building frontend..."
cd "$FRONTEND"
npm install --save-dev --save-exact --package-lock-only "$ADAPTER_STATIC"
npm ci --engine-strict=false
PUBLIC_MOBILE=true PUBLIC_VERSION="$VERSION_NAME-dev" PUBLIC_REDIRECT_AFTER_LOGOUT=/ npm run build

echo "→ Copying Android project..."
rsync -a --delete \
  --exclude='.gradle' --exclude='build' --exclude='.idea' \
  --exclude='app/src/main/assets/public' --exclude='capacitor-cordova-android-plugins' \
  "$ROOT/android/" "$PROJECT/"

echo "→ Renaming to sodevto..."
grep -q "$PROD_APP_ID" "$GRADLE" || { echo "✗ $PROD_APP_ID not found in build.gradle"; exit 1; }
sed -i "s/$PROD_APP_ID/$DEV_APP_ID/" "$GRADLE"
cp "$DEV_DIR/strings.xml" "$PROJECT/app/src/main/res/values/strings.xml"

echo "→ Syncing to Capacitor..."
cp "$ROOT/package.json" "$ROOT/package-lock.json" "$DEV_DIR/capacitor.config.json" "$BUILD/"
cd "$BUILD"
npm ci
npx cap sync android

echo "→ Building APK..."
cd "$PROJECT"
./gradlew assembleDebug
cp "$PROJECT/app/build/outputs/apk/debug/app-debug.apk" "$APK"

echo "✓ Done: $APK"
