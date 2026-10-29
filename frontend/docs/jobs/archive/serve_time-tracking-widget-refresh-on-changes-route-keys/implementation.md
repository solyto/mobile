## Summary

Time tracking mutations now ask the widgets to refresh. The widget bridge also handles two new route keys, `time_tracking` and `time_tracking_project`. Unit tests cover both.

## Changes

TASK-1: `src/lib/state/TimeTracking.svelte.ts`: added `if (res) this.auth.widgetBridge.notifyChanged();` after the reload in `startTimer`, `stopTimer`, `createEntry`, `updateEntry`, `deleteEntry`, `createProject`, `updateProject`, `deleteProject`, following the `Todos.svelte.ts` pattern. Category methods are unchanged.
TASK-2: `src/lib/state/WidgetBridge.ts`: `navigate()` now sends `time_tracking` to `urls.timeTracking` and `time_tracking_project` with a UUID id to `urls.timeTrackingProject`. Other ids are ignored.
TASK-3: `tests/unit/stores/TimeTracking.test.ts`: added a `widget refresh` describe. Table-driven `it.each` checks that each of the 8 mutations notifies once on success and never on failure, plus a test that category create/update/delete never notify.
TASK-4: `tests/unit/widgets/WidgetBridge.test.ts`: the `$app/paths` `resolve` mock now fills in `[param]` placeholders. Added tests for both new keys and for a bad, missing or non-string project id.

## Known issues / follow-ups

The tests were not run. `node_modules` is missing in this worktree, and installing dependencies needs approval. Run `npm test` / `npm run check` / `npm run lint` before merging.
