#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../.env"

if [ -z "$VERSION" ]; then
  echo "Usage: VERSION=1.0.8 make release"
  exit 1
fi

cd "$SCRIPT_DIR/.."

VERSION_CODE=$(echo "$VERSION" | awk -F. '{ printf "%d%02d%02d", $1, $2, $3 }')

echo "→ Refreshing vendored frontend from ../app..."
"$SCRIPT_DIR/vendor.sh"

echo "→ Setting version $VERSION ($VERSION_CODE)..."
npm pkg set version="$VERSION"
sed -i "s/versionCode [0-9]*/versionCode $VERSION_CODE/" android/app/build.gradle
sed -i "s/versionName \"[^\"]*\"/versionName \"$VERSION\"/" android/app/build.gradle

git add frontend package.json android/app/build.gradle
git diff --cached --quiet || git commit -m "chore: release v$VERSION"
git tag "v$VERSION"
git push origin main "v$VERSION"
