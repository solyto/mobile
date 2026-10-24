# Verdict: 10 Use the shared primitives in todo props

id: cigarette
reviewer: @reviewer
date: 2026-10-13

## Review

Branch verified: `feature/cigarette_10-use-the-shared-primitives-in-todo-props`. Base `main` (from `.manigot/manigot.json`).
Re-ran: `npm run check` gave 0 errors and 0 warnings (i18n parity included), and `npm run lint` was clean. The rule-7 grep (`grep -rl '<input' src --include='*.svelte' | grep -v /forms/`) now lists exactly the 8 files that the audit record marks as 7.4 or deferred.
The diff (`git diff main...HEAD`) matches `implementation.md`, and there are no unreported source changes.

TASK-1: PASS
notes: `DateInput` gains an optional `id`, used by `<label for="recurrence-ends-at">`. `NumberInput` stays untouched and gets its width from a `w-16` wrapper, as narrowed by the owner decision.

TASK-2: PASS
notes: `recurrence_every` and `recurrence_unit_{daily,weekly,monthly,yearly,fallback}` are added to the type and all four locales. Using unit words instead of the lowercased frequency label is a small, justified wording fix that is still inside "translate its strings". Cancel/Save reuse `layout.modal_cancel` / `layout.save`.

TASK-3: PASS
notes: `Recurrence.svelte` uses `SegmentedControl`, `NumberInput`, `DateInput`, `TextButton` (`plain`/`primary`) and `InlineDeleteButton` with `label`. The portal follows the `DueDate` pattern (`portal` prop, `use:portalToBody` anchored to the trigger, `closeOnScroll`), and only `TodoEditModal` passes it. The `find(…)?.label` markup expression moved into `intervalUnit()` (1.1). `save`/`remove`/`open` are unchanged, so recurrence behaviour is the same. The new `forms/SegmentedControl.svelte` was explicitly allowed by owner decision Q5.

TASK-4: PASS
notes: Title, Link and DevRequestEntry use `TextInput` with `bind:input`, `bind:value` and `onblur`. Title's width moved to a wrapper div.

TASK-5: PASS
notes: NoteTags, CreateNoteCategory (existing `notes.enter_folder_title` key reused) and TimeTrackingNavigation use `TextInput`. NoteHeader is left as is, per Q4.

TASK-6: PASS
notes: `TextInput` gains an optional `onkeydown`. The SecuritySettings key handling moved into named functions. Email/PhoneEdit use `TextInput` with new placeholder keys. Splitting the input from the type button into two rounded controls follows Q4 (no radius override on `TextInput`).

TASK-7: PASS
notes: `TextInput` gains a `class` passthrough (same `class: customClass` pattern as `TextButton`). UserList uses it only for padding, which `TextInput` doesn't set itself, so nothing conflicts. The placeholder now comes from `admin.search_placeholder`.

TASK-8: PASS (dropped by owner decision Q1)
notes: `routes/notes/import/+page.svelte` is recorded as a deferred violation in the audit table and the follow-ups.

TASK-9: PASS (documentation only, per Q3)
notes: Both overlay search fields are recorded as 7.4 (owner) cases.

TASK-10: PASS
notes: The audit record covers all 19 files and gives a reason for each.

Non-blocking observations (no change required):
- The brief's "manual pass" has not been done, because no API is available here. This is listed under the follow-ups in `implementation.md`, and the owner should do it before or after merge (Recurrence popover position in TodoEditModal/ListEntry, the 34px delete button in the compact row, and the separated Email/Phone controls).
- `.mcp.json` has an uncommitted worktree change that is not part of this job. It was left uncommitted on purpose.

## Security

none (not run)

## Overall

APPROVED

No blockers. Every task matches `tasks.md` as amended by the owner decisions, the scope stays within the brief, and check and lint are clean.
