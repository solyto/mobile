# Tasks: time tracking widget: refresh on changes, route keys

Branch verified: `feature/serve_time-tracking-widget-refresh-on-changes-route-keys`.

## TASK-1: Notify widgets after time tracking mutations

In `TimeTracking.svelte.ts`, call `this.auth.widgetBridge.notifyChanged()` on
the success path of `startTimer`, `stopTimer`, `createEntry`, `updateEntry`,
`deleteEntry`, `createProject`, `updateProject`, `deleteProject`. Leave
`createCategory`/`updateCategory`/`deleteCategory` alone.

- Files: `src/lib/state/TimeTracking.svelte.ts`
- Dependencies: none
- Risk: low. It only adds a call that is already debounced and does nothing
  off mobile. Follow the pattern `Todos.svelte.ts` already uses
  (`if (res) { ...; notifyChanged() }`).
- Note: the success check differs per method. `create`/`post` return
  `null` on failure, while `update`/`delete` return a boolean. Notify only
  inside the existing `if (res)` branch.

## TASK-2: Add `time_tracking` and `time_tracking_project` route keys

In `WidgetBridge.navigate()`, add:
- `key === 'time_tracking'`: `goto(resolve(urls.timeTracking))`
- `key === 'time_tracking_project' && id !== undefined && isUuid(id)`:
  `goto(resolve(urls.timeTrackingProject, { id }))`

Keep these exact key strings (they are a cross-repo contract). Unknown keys
and bad or missing ids stay ignored.

- Files: `src/lib/state/WidgetBridge.ts`
- Dependencies: none
- Risk: low. It is an additive branch in an existing `if/else` chain;
  `resolve(urls.timeTrackingProject, { id })` is already used in
  `TimeTrackingNavigation.svelte`.

## TASK-3: Store tests for widget refresh

In `tests/unit/stores/TimeTracking.test.ts`, add a `widget refresh` describe
modelled on the one in `tests/unit/stores/Todos.test.ts`
(`auth.widgetBridge.notifyChanged` is already mocked and reset in
`tests/unit/setup/storeMocks.ts`):
- each of the 8 mutations notifies once on success;
- a failed mutation does not notify (mock `create`/`post` → `null`,
  `update`/`delete` → `false`);
- category create/update/delete never notify.

- Files: `tests/unit/stores/TimeTracking.test.ts`
- Dependencies: TASK-1
- Risk: low. These are test-only changes. A table-driven `it.each` keeps the
  8 cases short.

## TASK-4: WidgetBridge navigate tests for the new keys

In `tests/unit/widgets/WidgetBridge.test.ts` `describe('navigate')`, cover:
- `time_tracking` → `goto('/time-tracking')`;
- `time_tracking_project` + valid UUID → `goto('/time-tracking/<id>')`;
- `time_tracking_project` with a bad id, a missing id, or a non-string id → no `goto`.

- Files: `tests/unit/widgets/WidgetBridge.test.ts`
- Dependencies: TASK-2
- Risk: low. One catch: the current `$app/paths` mock is
  `resolve: (path) => path`, which ignores params, so it would return
  `/time-tracking/[id]`. Extend the mock to substitute `[param]` from the
  second argument, e.g.
  `(path, params = {}) => path.replace(/\[(\w+)\]/g, (_, k) => params[k])`.
  Existing tests are unaffected.

## Out of scope
The native widget, the API, and any visible UI change. There are no i18n
changes.
