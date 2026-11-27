# Verdict: the dashboard downloads a year of check-in values to show a few averages

id: nearby
reviewer: @reviewer
date: 2026-11-23

## Review

TASK-1: PASS
notes: `CheckInData.loadDashboard()` (`src/lib/state/CheckInData.svelte.ts:88-101`) fetches only the trackers and `valuesUrl(today − 30 days, null)`. It skips the settings request and assigns `trackers`/`values`/`valuesFrom`/`loaded` only after both calls succeed (STANDARDS 12.2, 15.4). `load()` is unchanged.

TASK-2: PASS
notes: `tests/unit/stores/CheckInData.test.ts:127-170` covers both list URLs (`from=2026-10-21` for 2026-11-20), checks that `api.get` is never called, that state is set on success, and that the store stays unloaded (with `valuesFrom` unchanged) when either call fails. The fake-timer pattern matches the existing tests in the file.

TASK-3: PASS
notes: `QuickGlance.svelte` runs `Promise.all([loadDashboard(), goals.load()])` on mount when check-in is on. Both widgets' `onMount` loads, local `loaded` flags, `tick()` and the misleading comment/guard are gone. Empty-state conditions still hold: `CheckInWidget` uses `checkInData.loaded && values.length > 0`, and `GoalsWidget` uses `shown.length > 0`, which needs both trackers and goals. The diff touches only the planned files.

TASK-4: PASS
notes: `tests/components/quick-glance.test.ts` and `helpers/QuickGlanceHarness.svelte` assert one trackers request, one values request with the 30-day `from`, one goals request and no check-in settings request. The harness follows the existing `*Harness.svelte` pattern.

Verification: I checked this by reading the code only. `node_modules` is missing from the workspace, so I couldn't run `npm test`, `npm run check` or `npm run lint` (same limitation the developer reported). Run them before merging.

## Security

none (not run)

## Overall

APPROVED

Nothing blocks the merge.
