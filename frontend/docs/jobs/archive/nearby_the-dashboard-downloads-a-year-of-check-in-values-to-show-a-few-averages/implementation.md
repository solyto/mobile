# Implementation: the dashboard downloads a year of check-in values to show a few averages

id: nearby

## Summary

The dashboard's check-in widgets now load once, from `QuickGlance`, through a new
`CheckInData.loadDashboard()` that fetches only the trackers and the values of the last
30 days (owner's decision). The right column goes from 5 requests (one of them a year of
values) to 3: trackers, 30 days of values, goals.

## Changes

TASK-1: `src/lib/state/CheckInData.svelte.ts` — added `loadDashboard()` (`DASHBOARD_DAYS = 30`, `from` via `getDateMinusDays`). It skips the settings request and assigns trackers, values, `valuesFrom` and `loaded` only when both calls succeed. `load()` is unchanged.
TASK-2: `tests/unit/stores/CheckInData.test.ts` — tests for `loadDashboard()`: the two list URLs (`from=2026-10-21` for a fake 2026-11-20), no `api.get`, state set on success, stays unloaded when trackers or values fail.
TASK-3: `QuickGlance.svelte` runs `Promise.all([checkInData.loadDashboard(), goals.load()])` on mount when check-in is enabled. `CheckInWidget` and `GoalsWidget` no longer load anything: their `onMount` loads, local `loaded` flags, the `tick()` and the misleading comment/guard are gone. `CheckInWidget` shows on `checkInData.loaded && values.length > 0`; `GoalsWidget` on `shown.length > 0` (which needs both trackers and goals, so it can't show early).
TASK-4: `tests/components/quick-glance.test.ts` + `tests/components/helpers/QuickGlanceHarness.svelte` — mounts `QuickGlance` with the Navigation/CheckInData/Goals/Shortcuts stores and a spied `ApiService`, asserts one trackers request, one values request with the 30-day `from`, one goals request and no check-in settings request.

## Known issues / follow-ups

- The tests, `npm run check` and `npm run lint` could not be run: `node_modules` is not installed in this workspace, and installing was not approved. Run `npm ci && npm test && npm run check && npm run lint` before merging.
- Behavior change (owner-approved): averages cover the last 30 days, so a user with no check-in in that window no longer sees the check-in widget. No "30 days" label was added (see tasks.md).
- The load now runs in `QuickGlance`'s `onMount`. If `nav.features.checkIn` turns on while the dashboard is already open, the widgets stay hidden until the next visit. Before this change, they loaded when they mounted. This uses the same pattern as the todos load in `+page.svelte`.
