# Implementation: Set the html lang attribute to the active language

id: bunch
developer: developer agent
date: 2026-10-29

## Summary

`Translation.changeLanguage` now sets `document.documentElement.lang` to the active locale, so `<html lang>` follows the stored language, the navigator fallback and the switchers in settings and onboarding. `src/app.html` keeps `lang="en"` as the pre-boot default.

## Changes

TASK-1: `src/lib/state/Translation.svelte.ts` — after the `switch` in `changeLanguage`, `if (browser) document.documentElement.lang = this.locale;`. Uses `this.locale` so the `default` fallback to `en` is reflected; the `browser` guard avoids touching `document` during SSR.

TASK-2: Not verified. `node_modules` is not installed in this worktree, so `npm run check` fails with `svelte-kit: not found`. The manual dev-tools check also needs the dev server and a running API, and neither was available. No packages were installed, because installing needs approval.

## Known issues / follow-ups

- Still to do: run `npm run check`, then the manual check (switch the language in settings, confirm `<html lang>` changes, reload and confirm again) in an environment with dependencies installed.
