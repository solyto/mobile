# Brief: the dashboard downloads a year of check-in values to show a few averages

type: feature
id: nearby
branch: feature/nearby_the-dashboard-downloads-a-year-of-check-in-values-to-show-a-few-averages
date: 2026-11-23
author: Leander Muskalla

Source report: `docs/reports/2026-11-23-dashboard-check-in-widget-loads-a-year.md`

(`src/routes/+page.svelte`, `src/lib/components/dashboard/QuickGlance.svelte`,
`src/lib/components/dashboard/widgets/{CheckInWidget,GoalsWidget}.svelte`,
`src/lib/state/CheckInData.svelte.ts`).
Method: read the code at `283181e`. No code was changed. Nothing was measured against a
real API. The payload size and server cost of `GET /check-in/values` are **not verified**
(the backend is in another repo), so the latency effect is **inferred**.

**Overall: a performance fix for the most-visited page.** With check-in enabled, every
dashboard visit sends 5 requests for the right-hand column. One of them is a duplicate,
one is unused, and one downloads every check-in value of the last 12 months. The widget
only shows one average per scored tracker and a total.

Not a duplicate of earlier reports. `2026-11-19-todos-serial-reload.md` covers the todos
load on the same page, `2026-11-21-echarts-loaded-for-chartless-views.md` covers bundle
size. Neither touches check-in or goals.

---

## 1. Finding: a year of raw values for one number per tracker (verified in code)

`CheckInWidget.svelte:16-20` calls `checkInData.load()`, which fetches
`GET /check-in/values?from=<first of the month, 12 months ago>`
(`LOADED_MONTHS = 12`, `CheckInData.svelte.ts:21`). The widget then reduces it to:

```ts
const dates = $derived([...checkInData.index.keys()]);
const totalMean = $derived(checkInData.trackerService.totalMean(checkInData.scoredTrackers, checkInData.index, dates));
// per row: trackerService.mean(tracker, checkInData.index, dates)
```

So the dashboard shows a **12-month average** for each scored tracker. To do that it
transfers up to `trackers × ~380 days` rows. A user with 10 trackers who checks in daily
gets about 3,800 rows (~50 bytes each, so ~190 KB of JSON before gzip). The client also
builds `index` (a `Map` over all those rows) and a `Map` per day. The server has to read
the same range. All of that happens again on every dashboard visit, because
`setCheckInData()` in `src/routes/+page.svelte:23` creates a fresh store each time the page
mounts. The store isn't shared with `/check-in`, which has its own instance.

Side note on behavior: before `e64472f` (2026-11-20) the widget averaged **all** values.
That commit limited loading to 12 months for the check-in pages, and the dashboard average
changed meaning along with it without anyone noticing. Neither "all time" nor "last 12
months" was chosen on purpose for the dashboard.

## 2. Finding: the trackers list is fetched twice (verified in code)

`QuickGlance.svelte` renders both widgets inside the same `{#if nav.features.checkIn}`, so
they always mount in the same tick:

- `CheckInWidget` → `checkInData.load()` → `GET /check-in/trackers` (plus values and settings).
- `GoalsWidget.svelte:25-29` → `checkInData.trackers.length === 0 ? checkInData.loadTrackers() : …`.

At that moment `trackers` is still `[]`, because `load()` hasn't returned yet. So the
guard is always true and `GET /check-in/trackers` runs twice on every visit. The comment
("the check-in widget may not be there to load them") doesn't match the template. The
two widgets are never rendered without each other.

## 3. Finding: the check-in settings request is unused on the dashboard (verified in code)

`load()` also fetches `GET /users/me/settings/check-in` for `selectedSports`. Only
`CheckInSettings.svelte` and the daily check-in read that field. Nothing on the dashboard
does.

## 4. Suggestion

Ordered from smallest to largest. Steps 1 and 2 need no backend change and keep the
current behavior.

1. **Drop the duplicate trackers request.** Load once, in the parent. For example,
   `QuickGlance` (or the dashboard page) runs
   `Promise.all([checkInData.loadDashboard(), goals.load()])`, and `GoalsWidget` stops
   loading anything itself. Smaller alternative: have `loadTrackers()` return the
   in-flight `load()` promise if one is running. That needs a private field, like the
   `photoRun` pattern in `Contacts.svelte.ts`.
2. **Give the dashboard its own lighter load** (`loadDashboard()` or a flag on `load()`)
   that fetches only trackers and values, not the settings. Assign afterwards, per
   STANDARDS 12.2 (fetch → convert → assign). That's one request fewer per visit.
3. **Decide what the dashboard average should mean, then load only that.** This is a
   product question for the owner, and the answer sets the cost:
   - *"Last 30 days"* (or this month): pass a `from` 30 days back. That's about 1/12 of
     today's payload. No API change, since `valuesUrl(from, null)` already exists.
   - *"Last 12 months" / "all time"*: the proper fix is a server-side aggregate, e.g.
     `GET /check-in/means?from=` returning `{ tracker_id: mean }`. The scoring has to
     match `CheckInTrackerService.ratingScore()` (inverted trackers, zeros skipped), so
     that logic would move to or be mirrored in the API. Raise it in the backend repo.

   Recommendation: a short window. A one-year mean barely moves from day to day, so it
   tells the user little on a dashboard. A 30-day window makes the widget more useful and
   much cheaper, with no API work.

Combined, steps 1–3 (30-day variant) take the right column from 5 requests and a year of
rows to 3 requests (trackers, 30 days of values, goals) and roughly 1/12 of the data.

## 5. Tests

- `tests/unit/stores/CheckInData.test.ts`: the dashboard load calls `api.list` for
  trackers and for values with the chosen `from`, and does **not** call `api.get` for
  the settings.
- If `loadTrackers()` reuses an in-flight `load()`: calling both at once sends a single
  trackers request.
- `tests/components/dashboard-widgets.test.ts` doesn't cover `CheckInWidget` or
  `GoalsWidget` yet. A test that mounts `QuickGlance` with a mocked `ApiService` and asserts
  one `GET /check-in/trackers` would lock in step 1. (Optional: it's a contract on
  request count, not on markup.)

## 6. Risk

Low for steps 1 and 2. Step 3 changes what number the user sees, so it needs the owner's
call first, and probably a short label change (e.g. "30 days") through the normal i18n
flow. The `/check-in` pages are unaffected: they use their own store instance and
`load()`.

## 7. Not checked

- The real size and server cost of `GET /check-in/values` for heavy users.
- Whether the API already offers an aggregate or caches the values query.

## Decisions by the owner
30 days for the dashboard averages.
