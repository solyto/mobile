# Verdict: time tracking widget: refresh on changes, route keys

id: serve
reviewer: reviewer
date: 2026-10-29

## Review

Reviewed `git diff main...HEAD`. The source/test changes are limited to the four files in tasks.md; nothing out of scope.

TASK-1: PASS
notes: `TimeTracking.svelte.ts` calls `notifyChanged()` on the `if (res)` success path of all 8 mutations (startTimer, stopTimer, createEntry, updateEntry, deleteEntry, createProject, updateProject, deleteProject). It runs after the reload, as in `Todos.svelte.ts`. Category methods are untouched.

TASK-2: PASS
notes: `WidgetBridge.navigate()` adds `time_tracking` → `resolve(urls.timeTracking)` and `time_tracking_project` + `isUuid(id)` → `resolve(urls.timeTrackingProject, { id })`. The key strings match the contract exactly. `parseMessage` already drops non-string ids, and unknown keys or bad ids fall through and are ignored.

TASK-3: PASS
notes: A table-driven `it.each` covers success (notify once) and failure (`null` for create/post, `false` for update/delete: no notify) for all 8 mutations. Category create/update/delete never notify. The mocks match the store signatures (numeric category ids, `stopTimer(entryId)`).

TASK-4: PASS
notes: The `$app/paths` `resolve` mock now fills in `[param]` placeholders. The tests cover `/time-tracking`, `/time-tracking/<uuid>`, and a bad, missing or numeric project id. The existing tests still work, because routes without params are passed through unchanged.

## Security

none

## Overall

APPROVED

Not verified: `node_modules` is missing in this worktree, so I could not run `npm test` / `npm run check` / `npm run lint`. I checked the code by reading it and found no issues. Run them before merging.
