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

# Mobile-only build dependency: Capacitor needs a static (prerendered) build.
# Add it to the vendored package.json + lockfile (carried over from app) without
# disturbing the rest of the locked tree, so `npm ci` stays deterministic.
# Everything else comes from app (single source of truth).
( cd "$DEST" && npm install --save-dev --save-exact --package-lock-only @sveltejs/adapter-static@3.0.10 )
echo "✓ Vendored into $DEST — review and commit."
