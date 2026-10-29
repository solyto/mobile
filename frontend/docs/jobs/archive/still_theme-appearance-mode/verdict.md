# Verdict: theme-appearance-mode

id: still
reviewer: opencode-go/deepseek-v4-flash
date: 2026-10-11

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

TASK-1: PASS
notes: `src/lib/state/Theme.svelte.ts` adds `LS_APPEARANCE_KEY = 'appearance'`,
an `appearance = $state<'system' | 'light' | 'dark'>('system')` field,
`setAppearance()` (persists + re-resolves), and refactors `apply()` so the
`matchMedia('(prefers-color-scheme: dark)')` listener is registered only in
`system` mode (lines 89–94, 107–116). `load()` restores the saved appearance
before applying the theme (lines 19–25), so resolution uses the restored mode.
Unknown/absent values fall back to `system` (only `'light'`/`'dark'` are
accepted). `teardownDarkListener()` (lines 100–105) preserves the original
remove-listener behavior; non-dark-capable themes still
`classList.remove('dark')`. `applyDark()` unchanged; `html.dark` remains the
single switch. No listener leak across forced↔system and theme switches:
teardown runs before every branch and re-registers a fresh `matchMedia` only in
`system` mode.

TASK-2: PASS
notes: `appearance`, `appearance_system`, `appearance_light`, `appearance_dark`
added to `SettingsRecords` (`src/lib/types/translation.ts:137-140`) and to
`settings` in all four locales (`en.ts`, `de.ts`, `es.ts`, `fr.ts`). All four
are in sync; `npm run check` is the enforcement gate.

TASK-3: PASS
notes: `AppSettings.svelte` renders an Appearance `SettingsSection` inside
`{#if themeState.theme.supportsDarkMode}` (line 61), with three native
`<button>`s bound via `themeState.setAppearance(option.value)` and labels from a
`$derived` array (lines 25–29) so translations stay reactive. Styling follows
the `ViewSwitcher.svelte` pattern (`bg-c-neutral-1` / `dark:bg-s-dark-3` active
state). Strings come from `ts.get.settings.*`; no hardcoded text.

TASK-4: PASS
notes: `tests/unit/stores/Theme.test.ts` adds an `appearance` describe block
covering saved forced mode (no OS listener), unknown-value fallback to `system`,
`setAppearance('dark'|'light')` listener removal/`dark` class, and
re-registration on return to `system`. The shared `storage.get` mock is keyed by
`mockImplementation` on the key, distinguishing the appearance read from the
theme read. Existing `load`/`dark mode` tests remain valid: the pre-existing
`mockReturnValue` cases pass non-`light`/`dark` values so appearance stays
`system`, preserving the old OS-follow assertions.

TASK-5: PASS (verified by inspection; shell is unavailable in this review session)
notes: The diff is limited to the task files plus job artifacts. No changes to
`themes.ts` / theme picker cards, per brief. `npm run check`, `npm test` and
`npm run lint` results are reported in `implementation.md`; I could not
re-run them (session git shim denies `npm`). The documented 1 failing test
(`tests/components/logic-leaves.test.ts` StatisticWidget) is in files untouched
by this branch, so it cannot have been introduced here. Prettier drift is
repo-wide and pre-existing.

## Security

none

## Overall

APPROVED

The appearance mode is implemented as specified: app-global `appearance`
setting persisted under a new LocalStorage key, resolved as
system (live `prefers-color-scheme` listener) / forced light / forced dark,
surfaced only for dark-capable themes, with the OS listener registered only in
`system` mode and torn down otherwise. Theme identity and the picker are
untouched, all four locales are in sync, and the new resolution logic is
covered by tests. No blockers.
