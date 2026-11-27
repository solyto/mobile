# Verdict: notes-cross-references-and-backlinks

id: but
reviewer: anthony
date: 2026-11-24

Reviewed: `git diff main...HEAD` (`eff57ff`..`289fb8d`) against `tasks.md`, the backlog entry, `design.md`, the room decisions (backlinks API contract) and `docs/STANDARDS.md`.

Re-review after `f02feae`: `npm run check` 0 errors / 0 warnings, `note-links` + `notes` component tests (21) green, eslint on `notes/editor/` clean.

Checks (first pass):
- `NODE_OPTIONS=--max-old-space-size=1800 npm run check`: 0 errors, 0 warnings. This also checks that the i18n keys match across all six locales.
- Targeted tests, 6 files / 120 tests, all green:
  - `note-links`, `notes`
  - `NotePicker`, `UrlHelper`
  - `NoteLinkService`, `Notes` store
- `eslint` on every changed `.ts`/`.svelte` file: clean.
- Per decision `01M87EE81KBAJDVT7MK19PMRBA`, the full test suite was not run.

## Review

TASK-1: PASS
notes: `@tiptap/suggestion` pinned at `3.32.0`, the same version as the other TipTap packages. It was approved in backlog decision 3.

TASK-2: PASS
notes:
- `NoteLinkService`, `NoteBacklink`, `apiRoutes.notes.backlinks`, `searchLinkableNotes` and `loadBacklinks` match the contract.
- `loadBacklinks` clears the list first and drops a late response for a note the user already left.
- Hidden, journal and current notes are excluded.
- Its comment explains a constraint, so STANDARDS 10.1 allows it.

TASK-3: PASS
notes:
- Toolbar button and `NoteLinkModal` follow the design. The link is inserted through `linkService.hrefForNote`, and selected text becomes the link text (backlog decision 3).
- The result row is extracted into `NoteResultRow` and shared with `NoteSearch` (1.6).
- On Enter, the list handler (`KeyManager` priority 0, `preventOthers`) runs before the modal's own Enter handler, so a link is never inserted twice.

TASK-4: PASS
notes:
- Each key has exactly one owner. `KeyManager` handles the key through `NoteLinkList`, and the plugin's `onKeyDown` only returns `true` (STANDARDS 9).
- The picker search goes through `searchLinkableNotes` and `hrefForNote`.

TASK-5: PASS
notes:
- Open, Edit and Remove behave as specified.
- `InsertLinkModal` was extended with `initialUrl` rather than forked (7.2).
- Unsafe external URLs get no Open button.
- On mobile, size and class arrive as props (3.4).
- The 1.6 blocker from the first pass is fixed in `f02feae`:
  - `EditorPopover.svelte` now owns the off-screen root, the bindable `root` and the container base classes.
  - `TableBubbleMenu`, `LinkBubbleMenu` and `NoteLinkSuggestionList` all use it, with the same classes as before.
  - The suggestion list positions the shared root through `mount` in `onMount`, and the returned cleanup unmounts it.

TASK-6: PASS
notes:
- `NoteBacklinks` takes only props (3.3) and uses `resolve(urls.note, …)`. It is hidden when empty and sits below the editor as designed.
- Loading in the page's `afterNavigate` is one call that covers every way a note is opened, and it uses no `$effect` (5.1). This replaces the store-side call suggested in the interim review; the deviation is justified and documented in `implementation.md`.

TASK-7: PASS
notes:
- Five new keys, with `en` written by hand and the other five locales by the translator. The two `docs/I18N.md` glossary rows are part of the translation workflow.
- The component tests cover:
  - picker: filtering, category, keys, click;
  - popup: label, internal/external/unsafe open, edit, remove;
  - backlinks list.
- They test logic and contracts, not TipTap internals, as `docs/TESTING.md` asks.

Scope: no changes outside the tasks. The `NoteSearch` refactor is the extraction of the shared row and is part of TASK-3. No changes to `docs/policies/` or `docs/AGENTS.md`.

## Security

Not run separately. External links in the popup go through `safeHref`. `noteIdFromHref` rejects protocol-relative hosts (`//evil…`). Backlinks are owner-checked by the API (carmela's review).

## Overall

APPROVED

The only blocker (STANDARDS 1.6, duplicated bubble shell) is fixed in `f02feae`. Nothing else must change before merge.

`8b2d380` (after approval) adds `EditorPopoverDivider` and replaces the dead `toolbar-divider` class (1.8) in `TableBubbleMenu`, which was invited in review. As a result the table popup now shows its two dividers. Reviewed: still APPROVED.
