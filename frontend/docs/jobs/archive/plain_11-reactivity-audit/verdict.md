# Verdict: 11 Reactivity audit

id: plain
reviewer: @reviewer
date: 2026-10-13

## Review

Review surface: `git diff main...HEAD` (base `main` from `.manigot/manigot.json`), on branch
`feature/plain_11-reactivity-audit`. All changed files are covered by tasks; nothing outside
`tasks.md` scope remains in the net diff. The accidental `.mcp.json` change from `083c40a` was
reverted in `c4a161c`, so the net diff no longer contains it. `$effect` is now in 10 files,
and each one matches a 5.2 row in the implementation table. No `$derived(() => …)` remains.

TASK-1: PASS
notes: All 7 converted. Every `()` read site is gone in DashboardView, StatisticsView and TimeTrackingWidget.

TASK-2: PASS
notes: KanbanView `groups` is a writable `$derived(todos.groupedTodos)`. The dnd handlers still assign it, and the markup iterates `todos.groupedTodos` as before.

TASK-3: PASS
notes: The effect is removed. The default in `EventEdit` (`calendars.calendars[0]?.id ?? 0`) uses the same list that is passed as `availableCalendars`, so it matches the old child default. The post-save reset to `emptyForm` (calendar_id 0) is harmless because `EventEdit` sits behind `{#if calendars.editSidebar}` and `hideSidebar()` runs right after it.

TASK-4: PASS
notes: The default comes from `ContactEdit.emptyForm.address_book_id`, as stated.

TASK-5: PASS
notes: `bind:this={input}` binds directly, and neither caller binds `input`.

TASK-6: PASS
notes: The path-keyed `retriedPath`/`failedPath` resets for each new `imagePath` without an effect.

TASK-7: PASS

TASK-8: PASS
notes: The shared service instance is kept, and the reason is recorded in implementation.md as requested.

TASK-9: PASS
notes: The reset moved into `onQueryInput`. The behaviour change (clearing the search restores the browse list) is recorded under Q2.

TASK-10: PASS
notes: `ContactEdit` is mounted only under `{#if contacts.createModalVisible}`, and `openCreateModal`/`closeCreateModal` set and clear `activeContact` around it, so building the form once at mount is correct.

TASK-11: PASS

TASK-12: PASS
notes: Both `contentEl`s are rendered unconditionally.

TASK-13: PASS
notes: Bookkeeping is plain `let` and the misleading comment is removed. The effect still tracks the data props until the chart is created. The `onMount` + `tick().then(createChart)` double-init path already existed and is unchanged.

TASK-14: PASS

TASK-15: PASS

TASK-16: PASS
notes: `save` resets on the same two triggers as the old effect. `save` is never read in markup, so it does not matter that a writable `$derived` holds the object unproxied.

TASK-17: PASS
notes: All callers of `week/Day.svelte` pass `isMobile` as a literal or omit it, so `const dragEnabled = !isMobile` is sound. `dateSlug` correctly stays `$derived`.

TASK-18: PASS
notes: `hasEventsOnDate` covers events plus todos, which is equivalent to the old `hasEvents`.

TASK-19: PASS
notes: The desktop and mobile variants are changed identically.

TASK-20: PASS

## Re-review (after `273502f`)

Since the previous verdict (`a3df24d`), only `brief.md` (npm ci allowed) and `implementation.md` changed. The source diff is identical, so the per-task results above still apply.

I re-ran the automated gates myself on this branch:
- `npm run check`: 0 errors, 2 warnings. Both are `state_referenced_locally` at `EventEdit.svelte:67`. Those lines are identical on `main`, so the warnings are pre-existing and not caused by this job.
- `npm run lint`: clean.
- `npm test`: 62 files, 907 tests, all pass.

So blocker 1 from the previous verdict is resolved. The writable-`$derived` assignments and `const dragEnabled = !isMobile` type-check without warnings.

## Security

Not run.

## Overall

NEEDS WORK

The code is correct as far as reading it can tell, and check, lint and tests pass. One gate from the brief is still unmet: "Safety is `check` plus the existing tests plus a manual run of each touched screen". implementation.md says no screen was run, because no solyto API was reachable. Several changes can only be confirmed at runtime: the kanban drag-and-drop (TASK-2), the default calendar on a new event (TASK-3), the form reset in the contact edit (TASK-10), the chart cold-load (TASK-13) and the reset of unsaved check-in edits (TASK-16).

Must happen before merge:
1. Someone with a running backend (agents cannot do this here) must run every touched screen from the verification list in `tasks.md` and record the results in implementation.md: todos kanban, calendar event edit and mobile day/month/week, contacts create/edit, dev-request and note image upload, nav profile image, dashboard, finances overview, feed browser search, journal, library grid/shelf, check-in date, time-tracking dashboard/statistics/project, and admin charts. Alternatively, the owner can explicitly waive this gate in brief.md.
