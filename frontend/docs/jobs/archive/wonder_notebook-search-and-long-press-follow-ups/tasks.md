# Tasks: notebook search and long-press follow-ups

id: wonder
analyst: @analyst
date: 2026-11-22

Branch verified: `feature/wonder_notebook-search-and-long-press-follow-ups`.

## Task breakdown

TASK-1: Give the notebook search input a placeholder and an `aria-label`, both
from one new `notes` i18n key. Write `en` and hand de/es/fr/it/ru to the
`translator` agent.
- files: `src/lib/components/notes/NoteSearch.svelte`, `src/lib/i18n/en.ts`,
  `src/lib/i18n/{de,es,fr,it,ru}.ts` (translator), `src/lib/types/translation.ts`
  if the key type is declared there
- depends: none
- risk: low. One string and two attributes. `npm run check` catches missing locales.
- note: keep the copy short (e.g. "Search notes"). Placeholder and label can
  share the key.

TASK-2: Make `Notes.getCategoryTitle` find a folder at any depth by walking
`categories[].children` recursively. Add a third-level case to the existing
store test.
- files: `src/lib/state/Notes.svelte.ts` (~189-200),
  `tests/unit/stores/Notes.test.ts` (`categories` block, ~141-157)
- depends: none
- risk: low. It's a pure lookup and the existing tests cover it.
- note: `NoteCategory.children` has the type `NoteCategory[]`, not optional,
  and `MoveNoteModal` already recurses on it without a null check. The
  `if (cat.children)` guard can go unless the API really sends `null`. Keep
  returning `'-'` when nothing is found. A recursive walk is enough; an
  id → title map is not needed for this.

TASK-3: Focus the search input synchronously inside the opening tap or click,
instead of in a 50 ms `setTimeout` in `onMount`.
- files: `src/lib/components/notes/NoteSearch.svelte` (~23-32),
  `src/lib/state/Notes.svelte.ts` (`openSearch`, ~222) or the two click
  openers `src/lib/components/notes/NoteNavigationDesktop.svelte:53` and
  `src/lib/components/notes/NoteNavigationMobile.svelte:59-62`
- depends: none (do it together with TASK-4, same file)
- risk: medium. Focus timing differs by platform and can't be verified
  without an iOS device. The width transition (`inputExpanded`) must still
  animate.
- note: `NoteSearch` mounts because of a store change, so `onMount` runs after
  the click handler returns. To stay inside the gesture, the open path has to
  flush synchronously (Svelte `flushSync`). `onMount` then calls
  `searchInput.focus()` directly, and `inputExpanded` flips after that. Put
  the flush in one place: `Notes.openSearch()` serves both openers. Don't copy
  it into the desktop and mobile handlers (STANDARDS 6.2 / 2.4). Ctrl+K goes
  through the same method and is unaffected.

TASK-4: Register the Escape/ArrowUp/ArrowDown/Enter handlers only once the
input actually has focus, and release them whenever the search closes, so a
missed focus can never leave the arrow keys captured.
- files: `src/lib/components/notes/NoteSearch.svelte`
- depends: TASK-3
- risk: medium. Moving registration from `onMount` to a focus event changes
  when keys are live. Escape must still close the search, and Ctrl+K reopening
  must not register twice.
- note: e.g. register in an `onfocusin` on the input, guarded so it doesn't
  register a second time. The existing `onfocusout` → `closeSearch()` and
  `onDestroy` already unregister. If focus never lands, nothing is captured,
  and tapping the input registers the keys then. Go through `KeyManager` only
  (STANDARDS 9).

TASK-5: Apply `user-select: none` on the long-press nav rows only for touch
(coarse pointer), so mouse users can select titles again.
- files: `src/lib/helpers/ContextMenuHelper.ts:12-14`
- depends: none
- risk: low. It's styling only, but hybrid devices (touch laptop, iPad with
  trackpad) depend on how the media query evaluates there.
- note: an inline style can't hold a media query. Either the action adds a
  Tailwind `pointer-coarse:select-none` class (the string must appear
  literally in the `.ts` file so Tailwind scans it), or the action checks
  `matchMedia('(pointer: coarse)')`. The class keeps it declarative and
  reacts to pointer changes, so prefer it. Keep the behaviour in the action
  rather than at the four call sites (STANDARDS 2.4). Safari needs
  `-webkit-user-select`. Tailwind's `select-none` emits it, but the current
  inline `node.style.userSelect` does not, so iOS selection may be
  unsuppressed today. The developer should check the generated CSS.
  `-webkit-touch-callout: none` can stay unconditional.

TASK-6 (manual, not for @developer): Test long press on one real iOS device
and one real Android device. Check whether the menu closes right after it
opens because a compatibility `mousedown`/`touchstart` reaches `clickOutside`
(`src/lib/helpers/ClickHelper.ts`). Open a fix task only if it reproduces.
- files: none unless it reproduces. Then likely `ContextMenuHelper.ts` and/or
  `ClickHelper.ts`.
- depends: TASK-5 (test the final helper)
- risk: medium. Needs real hardware that this pipeline doesn't have. An
  emulator or Playwright touch emulation doesn't reproduce compat-event
  timing faithfully.
- note: also watch for a double open on Android. The native `contextmenu`
  from a long press and the 500 ms timer both call `open()`, possibly with
  different coordinates. `onContextMenu` clears the timer only if it fires
  first. This is an observation only and not in the brief's scope: report it,
  don't fix it.

## Open points

- TASK-6 requires a human with devices. The pipeline can't verify TASK-3 on
  iOS either. Both should be marked "unverified on device" in
  `implementation.md`.
- Out of scope per the brief: Ctrl+K opening the search over the
  Move-to-folder modal.
