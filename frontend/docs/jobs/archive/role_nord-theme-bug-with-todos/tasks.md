# Tasks: nord theme bug with todos

id: role
status: open
analyst: deepseek-v4-flash
date: 2026-08-25

<!-- Produced by @analyst from brief.md. -->

## Root cause (investigation)

The Todo "change status" menu is rendered by `QuickSelectOverlay.svelte`, which
themes its surface with `bg-white dark:bg-s-dark-2`. The `dark:` Tailwind
variant only takes effect when `<html>` has the `dark` class.

Single-mode themes (Nord and every other theme with `supportsDarkMode: false`
in `src/lib/config/themes.ts`) never add the `dark` class — `ThemeState.apply()`
(`src/lib/state/Theme.svelte.ts`) calls `document.documentElement.classList.remove('dark')`
for them. So under Nord the themed `dark:bg-s-dark-2` never applies and the
menu falls back to the light `bg-white`, appearing white / unthemed.

The same applies to **all** single-mode themes (Dracula, Gruvbox, Skyrim,
Catppuccin, Terminal, Paper, Atari), confirming the brief's suspicion that
"it affects other themes as well".

The codebase's correct pattern for themed surfaces is the semantic token
`bg-c-bg-modal` (see `RightClickMenu.svelte`, `PopupContentModal.svelte`,
`SlidingSideBar.svelte`, `libraries/filters/*`), which every theme overrides at
`:root` — so it themes correctly regardless of the `dark` class.

## Task breakdown

TASK-1: Fix the shared Todo status/priority/effort menu surface by switching
     `QuickSelectOverlay.svelte` from `bg-white dark:bg-s-dark-2` to the
     always-overridden token `bg-c-bg-modal` (keeps `dark:`-independent
     theming). This resolves the reported Todo status menu and, at the same
     time, all other consumers of the overlay (Todo Priority/Effort,
     calendars EventAttachments, check-in cell editor, library import menu).
     files: src/lib/components/ui/QuickSelectOverlay.svelte
     depends: none
     risk: low — single shared component, one class change to an established
     token pattern already used by equivalent menus (RightClickMenu).

TASK-2: Fix the Todo recurrence popup menu, which uses the same broken
     `bg-white dark:bg-s-dark-2` surface, by switching it to `bg-c-bg-modal`.
     files: src/lib/components/todos/props/Recurrence.svelte
     depends: none (independent of TASK-1)
     risk: low — mechanical token swap in one component.

TASK-3: Fix the Todo "find category" right-click menu, which uses the same
     `bg-white dark:bg-s-dark-2` surface, by switching it to `bg-c-bg-modal`.
     files: src/lib/components/todos/FindCategoryMenu.svelte
     depends: none (independent of TASK-1)
     risk: low — mechanical token swap in one component.

TASK-4: Sweep the remaining app-wide popup/surface components that rely on the
     `bg-white ... dark:bg-s-dark*` pattern and re-theme them with
     `bg-c-bg-modal` (or `bg-c-bg-surface`/`bg-c-bg-elevated` as appropriate).
     Includes: contacts ChooseAddressBook / AddressBook / AddressBooks /
     PhoneEdit / EmailEdit, calendars RecurrenceActionModal / MobileCalendarHeader,
     notes editor EditorToolbar / TableBubbleMenu / InsertImageModal,
     time-tracking ProjectCreate, forms/TimePicker, dev-requests/Comments,
     admin/setup/auth/finances/check-in route page backgrounds.
     files: (representative)
       src/lib/components/contacts/ChooseAddressBook.svelte
       src/lib/components/contacts/PhoneEdit.svelte
       src/lib/components/contacts/EmailEdit.svelte
       src/lib/components/calendars/RecurrenceActionModal.svelte
       src/lib/components/calendars/MobileCalendarHeader.svelte
       src/lib/components/notes/editor/EditorToolbar.svelte
       src/lib/components/notes/editor/TableBubbleMenu.svelte
       src/lib/components/time-tracking/ProjectCreate.svelte
       src/lib/components/forms/TimePicker.svelte
       src/lib/components/dev-requests/Comments.svelte
     depends: none (can be done after TASK-1 for consistency, but independent)
     risk: medium — touches many files; scope is broad, so split per surface if
     needed and verify each still renders correctly in both the default
     light/dark theme and a single-mode theme (e.g. Nord). If this sweep grows
     beyond the job's intent, prefer deferring to a follow-up job.

## Follow-ups / notes for reviewer

- The broad TASK-4 sweep is the largest risk. The brief's primary ask is the
  Todo status menu; TASK-1 alone resolves that plus every other
  `QuickSelectOverlay` menu. TASK-2/TASK-3 cover the other Todo popups.
  TASK-4 is the "check if it affects other themes/components" portion and can
  be trimmed to just the popup/menu surfaces most visible to users if desired.
- No i18n string changes required; no test changes expected (existing
  `tests/unit/stores/Theme.test.ts` already asserts Nord removes the `dark`
  class, confirming this analysis).
- No render report (screenshots/) exists for this job; verification should be
  done manually under Nord (and at least one other single-mode theme plus the
  default light/dark theme).

