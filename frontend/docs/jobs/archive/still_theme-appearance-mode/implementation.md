# Implementation: theme-appearance-mode

id: still
developer: opencode-go/deepseek-v4-flash
date: 2026-10-11

## Summary

Added an app-global *appearance mode* (system / light / dark) that is separate
from theme identity. The `Default` theme (the only one with
`supportsDarkMode`) can now be forced into light or dark regardless of the OS
`prefers-color-scheme`, via a small Auto/Light/Dark control in the settings
page. `html.dark` remains the single switch; the OS media-query listener is
still registered only in `system` mode.

## Changes

TASK-1: `src/lib/state/Theme.svelte.ts`
- Added `LS_APPEARANCE_KEY = 'appearance'` and an `appearance =
  $state<'system' | 'light' | 'dark'>('system')` field.
- `load()` restores the saved appearance first (unknown/absent values fall back
  to `system`), then applies the theme so resolution uses the restored mode.
- Added `setAppearance(mode)` — persists to LocalStorage and re-resolves dark
  immediately; only touches the DOM for dark-capable themes.
- Refactored `apply()`: extracted the listener teardown into
  `private teardownDarkListener()` and the resolution into
  `private applyAppearance()`. Inside the `supportsDarkMode` gate, `system`
  registers the `matchMedia('(prefers-color-scheme: dark)')` change listener as
  before; `light`/`dark` force `applyDark(false/true)` with no listener.
  Non-dark-capable themes still `classList.remove('dark')` exactly as before.
- `applyDark()` unchanged.

TASK-2: `src/lib/types/translation.ts`, `src/lib/i18n/{en,de,es,fr}.ts`
- Added `appearance`, `appearance_system`, `appearance_light`,
  `appearance_dark` to `SettingsRecords` and all four locale tables (section
  label plus one per Auto/Light/Dark option).

TASK-3: `src/lib/components/settings/AppSettings.svelte`
- Added an Appearance `SettingsSection` after the theme picker, gated by
  `{#if themeState.theme.supportsDarkMode}` so it is reactive to theme
  switches. It renders three inline buttons (Auto / Light / Dark), following
  the `ViewSwitcher.svelte` styling (`bg-c-neutral-1` /
  `dark:bg-s-dark-3` active state), and calls
  `themeState.setAppearance(option.value)`. Option labels come from a
  `$derived` array so translations stay reactive.

TASK-4: `tests/unit/stores/Theme.test.ts`
- Added an `appearance` describe block: a saved forced appearance loads without
  registering the OS listener; unknown values fall back to `system` (listener
  registered); `setAppearance('dark')` persists and removes the existing OS
  listener; forced light drops the `dark` class and adds no listener; switching
  back to `system` re-registers the listener.
- Existing dark-mode/system tests kept passing unchanged.

TASK-5: verification
- `npm run check`: 0 errors, 0 warnings.
- `npm test`: 765 passed, 1 failed — see Known issues.
- `npm run lint`: repo-wide prettier drift, pre-existing; ESLint passes on all
  changed files (`npx eslint` exit 0).

## Known issues / follow-ups

- `tests/components/logic-leaves.test.ts` > `StatisticWidget > applies the
  requested color classes` fails on this branch **before** this job's changes
  (the test expects `bg-blue-50`/`text-blue-600` while the component has used
  theme tokens `bg-c-btn/10`/`text-c-btn` since the base commit `cc5d8ea`).
  Unrelated to this job; left untouched.
- `npm run lint` (`prettier --check .`) reports 484 already-unformatted files
  at the base commit as well, including every file this job touches
  (`translation.ts`, the four i18n files, `AppSettings.svelte`). The added lines
  follow the surrounding style and ESLint is clean; the pre-existing repo-wide
  formatting drift was intentionally not reformatted (out of scope).
- Rendered verification via `shot` was not possible: `/settings` is
  auth-gated and this environment has no API backend (no server on
  `:8000`), so the app redirects to `/auth/login` before the appearance
  control renders. Verification therefore relies on `svelte-check` plus the
  unit tests, which pin the resolution/listener behaviour the control drives.
