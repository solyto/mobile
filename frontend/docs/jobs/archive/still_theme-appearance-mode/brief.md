# Brief: theme-appearance-mode

type: feature
id: still
branch: feature/still_theme-appearance-mode
date: 2026-10-11
author: Leander Muskalla

## What

# Brief: theme appearance mode

<!-- Frontmatter (type, id, branch, date, author) is generated host-side by `mg job` when this job is scaffolded. -->

## What

Let users force the Default theme into light or dark even when their OS `prefers-color-scheme` disagrees.

Separate the concept of *theme identity* (which design, the existing theme picker) from *appearance mode* (system / forced-light / forced-dark). Only themes that declare `supportsDarkMode` (currently just `default`) get the mode control.

- Add an `appearance` setting (system / light / dark) persisted in a new LocalStorage key.
- Show it in `AppSettings.svelte` as a small Auto/Light/Dark segmented control, visible only when the selected theme `supportsDarkMode`.
- Effective dark is resolved as: `system` → react to `prefers-color-scheme` (current behavior, including live listener on change), `light`/`dark` → forced, no listener.
- Theme picker stays a picker of designs — one `Default` card, no new theme entries.

## Why

A user on macOS/Windows/Fedora with a dark OS preference has no way to use the brand Default theme in light mode; it always follows the OS.

## Out of scope

- No new three-variant themes (Default Auto / Light / Dark cards) in the picker.
- No dark palettes for the currently light/dark-only themes (Nord, Paper, etc.).
- No per-theme appearance; one app-global appearance setting that applies to any dark-capable theme.

## Notes

- Files: `src/lib/state/Theme.svelte.ts` (state + `apply()`/`applyDark()` resolution, listener only in system mode), `src/lib/components/settings/AppSettings.svelte` + i18n (`en`/`de`/`es`/`fr`) for the mode control labels.
- The `html.dark` class is the single switch everything else already keys off (`dark:` variants, `default.css` token overrides) — keep using it.

## Why

<!-- Why does this need to exist? What problem does it solve for the user? -->

## Out of scope

<!-- What are we explicitly NOT doing in this job? -->

## Notes

<!-- Anything the analyst or developer should know before starting. -->
