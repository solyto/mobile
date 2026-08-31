## Summary

Fixed the Todo "change status" menu appearing white/unthemed under the Nord theme
(and all other single-mode themes). Root cause: the menu (and many other popup
surfaces) themed their background with `bg-white dark:bg-s-dark-*`, but the
`dark:` Tailwind variant only applies when `<html>` has the `dark` class.
Single-mode themes (Nord, Dracula, Gruvbox, Skyrim, Catppuccin, Terminal, Paper,
Atari — all `supportsDarkMode: false` in `src/lib/config/themes.ts`) never add
the `dark` class, so the themed `dark:bg-s-dark-*` never applied and the surface
fell back to light `bg-white`. In Nord, `--color-white` is overridden to a
near-white `#eceff4`, confirming the "white background" report.

The fix swaps those backgrounds for the semantic tokens `bg-c-bg-modal`,
`bg-c-bg-surface`, `bg-c-bg-elevated` (and page wrappers to `bg-c-bg`), which
every theme overrides at `:root` and therefore theme correctly regardless of the
`dark` class — the same pattern already used by `RightClickMenu.svelte`,
`PopupContentModal.svelte`, `SlidingSideBar.svelte`, and `libraries/filters/*`.

## Changes

TASK-1: `src/lib/components/ui/QuickSelectOverlay.svelte` — switched the shared
  overlay surface from `bg-white dark:bg-s-dark-2` to `bg-c-bg-modal`. Resolves
  the reported Todo status menu plus every other consumer of the overlay (Todo
  Priority/Effort, calendar EventAttachments, check-in cell editor, library
  import menu).

TASK-2: `src/lib/components/todos/props/Recurrence.svelte` — switched the
  recurrence popup surface from `bg-white ... dark:bg-s-dark-2` to
  `bg-c-bg-modal` (kept `dark:border-s-dark`).

TASK-3: `src/lib/components/todos/FindCategoryMenu.svelte` — switched the
  find-category right-click menu surface from `bg-white ... dark:bg-s-dark-2` to
  `bg-c-bg-modal` (kept `dark:border-s-dark`).

TASK-4: Swept the remaining app-wide popup/surface components that relied on the
  same `bg-white ... dark:bg-s-dark*` pattern and re-themed them with semantic
  tokens:
  - `bg-c-bg-modal` (floating popups/dropdowns/modals):
    contacts `ChooseAddressBook`, `PhoneEdit`, `EmailEdit`; calendars
    `ChooseCalendar`, `RecurrenceActionModal`; forms `TimePicker`;
    time-tracking `ProjectCreate`; notes editor `TableBubbleMenu`.
  - `bg-c-bg-surface` (in-flow panels/headers/toolbars/cards/inputs):
    calendars `MobileCalendarHeader`, `views/month/MobileMonthView`; notes editor
    `EditorToolbar`; dev-requests `Comments`; contacts `AddressBook`,
    `AddressBooks`, `Search`; admin `UserList`, `UserEntry`, `StatisticWidget`;
    auth/setup/verify/logout card surfaces; check-in `trends`; time-tracking
    `[id]`.
  - `bg-c-bg-elevated` (elevated hover/active states): contacts
    `ManageAddressBooks`, calendars `ManageCalendars`, notes
    `CreateNoteCategory`, notes editor `InsertImageModal` active tab.
  - `bg-c-bg` (full-page wrappers): admin `+layout`, `AdminNavbar`.

  Legitimate `dark:border-*` and `dark:hover:*` overrides were preserved.

No i18n string changes and no test changes were required.

## Known issues / follow-ups

- `node_modules` is not installed in this environment, so `npm run check`,
  `npm run build`, and `npm test` could not be executed to verify the changes.
  All edits were exact string replacements of established Tailwind utility
  classes (`bg-c-bg`, `bg-c-bg-surface`, `bg-c-bg-modal`, `bg-c-bg-elevated`)
  already used elsewhere in the codebase, so no syntax/schema impact is
  expected. Recommended to run `npm run check` and visually verify under Nord
  (plus one other single-mode theme and the default light/dark theme) once
  dependencies are installed and a backend is available.
- `docs/jobs/role_nord-theme-bug-with-todos/tasks.md` and `/workspace/AGENTS.md`
  carry working-tree modifications that predate this implementation (job
  scaffold / analyst analysis). They were intentionally left out of the task
  commits.
