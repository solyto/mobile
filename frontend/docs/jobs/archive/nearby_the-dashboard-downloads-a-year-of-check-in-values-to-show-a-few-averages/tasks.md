# Tasks: the dashboard downloads a year of check-in values to show a few averages

id: nearby
analyst: @analyst
date: 2026-11-23

Scope: brief steps 1–3, with the owner's decision "30 days for the dashboard averages".
Target: the dashboard's right column sends 3 requests (trackers, last 30 days of values,
goals) instead of 5. The `/check-in` pages and `AlertSettings` keep using `load()`
unchanged.

## Task breakdown

TASK-1: Add `loadDashboard()` to `CheckInData`. It fetches only the trackers and the values from 30 days ago (`valuesUrl(from, null)`), skips the settings request, and assigns `trackers`, `values`, `valuesFrom` and `loaded` only after both calls succeed (STANDARDS 12.2: fetch → convert → assign).
files: src/lib/state/CheckInData.svelte.ts
depends: none
risk: low — new method next to `load()`. `load()` and its callers don't change.

TASK-2: Unit-test `loadDashboard()` in the store tests: with a fake system time, it calls `api.list` for `/check-in/trackers` and for `/check-in/values?from=<today − 30 days>`, it never calls `api.get`, it sets `valuesFrom`/`loaded`, and it stays unloaded when either list call fails.
files: tests/unit/stores/CheckInData.test.ts
depends: TASK-1
risk: low — test only, same pattern as the existing `load` tests.

TASK-3: Load once in `QuickGlance`. When `nav.features.checkIn` is on, run `Promise.all([checkInData.loadDashboard(), goals.load()])` there. `CheckInWidget` and `GoalsWidget` stop loading anything themselves: remove their `onMount` loads and the misleading comment and `trackers.length === 0` guard in `GoalsWidget`, and render once the parent load has finished.
files: src/lib/components/dashboard/QuickGlance.svelte, src/lib/components/dashboard/widgets/CheckInWidget.svelte, src/lib/components/dashboard/widgets/GoalsWidget.svelte
depends: TASK-1
risk: medium — it moves the load timing and the "loaded" gating between components. A mistake shows an empty or flashing widget, or one that never appears. Check that each widget's existing empty-state condition (`values.length > 0`, `shown.length > 0`) still holds.

TASK-4: Component test for the request contract. Mount `QuickGlance` with check-in enabled and a mocked `ApiService`, then assert exactly one trackers request, one values request with the 30-day `from`, no check-in settings request, and one goals load.
files: tests/components/dashboard-widgets.test.ts (or a new tests/components/quick-glance.test.ts), possibly tests/components/helpers/context.ts if the CheckInData/Goals/Navigation stores need seeding
depends: TASK-3
risk: low — test only. It may need context seeding for stores that `renderWithContext()` doesn't provide yet.

## Notes / open points

- **Behavior change (owner-approved):** the dashboard averages now cover the last 30 days, not the last 12 months. A side effect: `CheckInWidget` hides itself when `values.length === 0`, so a user with no check-in in the last 30 days will no longer see the widget. That follows from the decision, but it's worth knowing.
- **Label:** the brief says a "30 days" label is *probably* needed. The owner's decision doesn't ask for one, and the project rule is "less text in UIs", so no task adds one. If the owner wants a label, add a follow-up task: write `en`, then hand the other locales to the translator agent.
- **"30 days" exactly:** this plan takes `from = today − 30 days` (`getDateMinusDays` in DateHelper), not "this month". The averages use `index.keys()`, so they cover only the days that have values in that window.
- No backend change. A server-side aggregate isn't needed for a 30-day window.
