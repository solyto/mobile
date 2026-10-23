# Tasks: theme-appearance-mode

id: still
analyst: opencode-go/deepseek-v4-flash
date: 2026-10-11

<!-- Produced by @analyst from brief.md. -->

## Task breakdown

TASK-1: Add the app-global appearance setting to `ThemeState` and resolve effective dark from it.
     files: src/lib/state/Theme.svelte.ts
     depends: none
     risk: medium — the media-query listener lifecycle (register only in `system` mode, tear down when switching to forced light/dark or to a non-dark-capable theme, keep teardown-clean across theme switches) is the delicate part; regression risk on the current OS-follow behavior, which the existing Theme store tests (TASK-4) pin.

TASK-2: Add i18n keys for the appearance section and its three options (suggested `appearance`, `appearance_system`, `appearance_light`, `appearance_dark` — one key for the section label + one per Auto/Light/Dark option) to `SettingsRecords` in the translation type and all four locales.
     files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
     depends: none
     risk: low — mechanical additions; `npm run check` enforces the four-locale invariant.

TASK-3: Render the small Auto/Light/Dark segmented control in `AppSettings.svelte`, visible only when `themeState.theme.supportsDarkMode`, bound to the new `appearance` state via `setAppearance()`.
     files: src/lib/components/settings/AppSettings.svelte
     depends: TASK-1, TASK-2
     risk: low — presentational addition; `themeState.theme` is `$state` so the visibility gate updates reactively when the user picks a different theme. No new reusable component needed — follow the inline button styling already used by `ViewSwitcher.svelte` (rounded, `bg-c-neutral-1` / `dark:bg-s-dark-3` active state).

TASK-4: Extend `tests/unit/stores/Theme.test.ts` for the new resolution logic.
     files: tests/unit/stores/Theme.test.ts
     depends: TASK-1
     risk: medium — the shared `storage.get` mock is keyed by string, so the new appearance read in `load()` must be distinguished from the theme read (e.g. `mockImplementation` on the key, not a single return value); existing dark-mode tests must keep passing for the default `system` mode, and the DOM stubs must model listener add/remove precisely.

TASK-5: Verify with `npm run check`, `npm test`, and `npm run lint`.
     files: none (verification only)
     depends: TASK-1, TASK-2, TASK-3, TASK-4
     risk: low — standard verification gate; `npm run check` is the i18n-sync gate for TASK-2.

## Notes

- Theme identity vs appearance mode: `themes.ts` is untouched — no new theme variants, `supportsDarkMode` stays as-is (only `default` is dark-capable). The picker stays a picker of designs.
- TASK-1 implementation guidance (matching `docs/STATE_SERVICES.md` conventions):
  - New key constant `static readonly LS_APPEARANCE_KEY: string = 'appearance'` (existing keys are the bare `'theme'` / `'animations'` strings, so no `_` prefix needed).
  - New `$state<'system' | 'light' | 'dark'>` field defaulting to `'system'`; restore it in `load()` (graceful fallback for unknown/absent values), persist via `this.localStorage.set(...)` in a new `setAppearance()` method that re-resolves dark immediately.
  - Refactor `apply()`: theme-link loading and the `supportsDarkMode` gate stay; inside the gate, branch on appearance — `system` → existing `matchMedia('(prefers-color-scheme: dark)')` + change listener; `light` → `applyDark(false)`, `dark` → `applyDark(true)`, and in both forced modes ensure any previously registered listener is removed. Non-dark-capable themes keep `classList.remove('dark')` as today.
  - `html.dark` stays the single switch; `applyDark()` is unchanged.
  - Optional per `docs/STATE_SERVICES.md` §Constructor injection: moving `localStorage = new LocalStorageService()` into an injectable constructor is allowed but not required — the store tests already mock the module.
- `ThemeState.load()` only runs in `onMount` (`src/routes/+layout.svelte`), so browser-only DOM access is already safe; no SSR concern.
- Out of scope (per brief): no new theme picker cards, no dark palettes for other themes, no per-theme appearance.