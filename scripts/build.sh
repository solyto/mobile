#!/usr/bin/env bash
# Local dev build: refresh the vendored frontend from ../app, then build it.
# CI and F-Droid do NOT use this (they build the committed frontend via build-fdroid.sh).
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/vendor.sh"
"$SCRIPT_DIR/build-fdroid.sh"
