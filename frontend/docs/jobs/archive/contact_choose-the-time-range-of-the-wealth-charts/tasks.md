# Tasks: choose the time range of the wealth charts

id: contact
analyst: analyst
date: 2026-11-17

## Findings from reading the code

- `getGraphValues()` (`src/lib/services/WealthStatisticsService.ts:11-69`)
  hardcodes 12 months in two places: `startDate.setMonth(... - 11)` (`:26`)
  and `for (let i = 11; ...)` (`:41`). Both use `setMonth` on today's date,
  which causes the 29th–31st overflow bug.
- `lastValues` (`:13-21`) is computed but never read. It is dead code inside
  the function being rewritten.
- The "before the start" filter compares `new Date(v.date) < startDate`.
  `v.date` is `Y-m-d`, which `new Date` parses as UTC, while `startDate` is
  local. Once the start becomes the 1st of a month at local midnight, a value
  dated on the 1st can land on the wrong side in non-UTC timezones. Compare
  `YYYY-MM` strings instead, the same way the month loop already matches
  months with `startsWith(monthStr)`.
- The existing test `returns one entry per month ...`
  (`tests/unit/services/WealthStatisticsService.test.ts:32-39`) expects the
  last point's `date` to be today's date. Once points are built from the 1st
  of the month, it becomes `YYYY-MM-01`. `getMonthLabels()` only reads year
  and month, so the labels don't change, but this test must be updated.
- **`StackedAreaChart.svelte` does not redraw when its props change.** Its
  `$effect` (`:106-110`) is guarded by a plain, non-reactive `isInitialized`.
  After the first draw it tracks nothing, so changing the range would update
  the trend chart (`SmoothLineChart` redraws on prop change, `:141-145`) but
  leave the composition chart stale. This needs a fix (TASK-4).
- A reusable button group already exists:
  `src/lib/components/forms/SegmentedControl.svelte` (string values,
  `bind:value`), used in `todos/props/Recurrence.svelte` and
  `settings/NavigationOrder.svelte`. Use it instead of new buttons
  (STANDARDS 7.1).
- Both chart wrappers use an echarts `category` x-axis without
  `axisLabel.interval`. echarts' default (`'auto'`) already hides overlapping
  labels, so "all" may already be readable on a phone. Check this first and
  add thinning only if needed.
- Locales: `en, de, es, fr, it, ru` (six). `ru.ts` packs several keys per
  line. Translation type: `FinanceRecords` in `src/lib/types/translation.ts:805`.

## Open points (not blocking; proposed defaults)

- **"All" with no values at all** (only fields without any history): the
  brief doesn't say what happens. Proposed: show the current month only
  (1 point). The other option is to fall back to 12 months. If the reviewer
  or owner disagrees, it's a one-line change.
- **"All" when the earliest value is less than 12 months old:** the brief
  says "all starts at the month of the earliest value", so "all" can be
  shorter than "1 year". This plan follows the brief literally.

## Task breakdown

TASK-1: Change `getGraphValues()` to take a range (a number of months, or
`'all'`) and build months from the 1st of the current month. This removes the
`setMonth` overflow, keeps the carry-forward logic, and removes the dead
`lastValues`.
  files: src/lib/services/WealthStatisticsService.ts
  depends: none
  risk: medium — this is the core logic behind three charts; the month
  arithmetic and the past-value comparison must be timezone-safe (compare
  `YYYY-MM` strings, build local dates `new Date(y, m, 1)`).
  notes:
  - Signature, e.g. `getGraphValues(range: number | 'all')`. For a number,
    the first point is the 1st of the current month minus `range - 1` months.
    For `'all'`, it is the month of the earliest `values[].date` across all
    fields (see the open point for when there are no values).
  - Each point's `date` is the 1st of its month (`getUrlFormat` of a local
    `new Date(y, m, 1)`).
  - Baseline: for each field, the latest value whose month is before the
    first month, else 0. Then, per month, the latest value in that month
    replaces the carried value. Same behaviour as today.
  - Define the range options once (e.g. an exported constant or type next to
    the service: `[12, 36, 60, 'all']`) so the two pages don't duplicate them
    (STANDARDS 2.2). The default is 12.

TASK-2: Extend and adjust the service tests: 1/3/5 years give 12/36/60
points ending at the current month; "all" starts at the earliest value's
month; a value from before the range carries into the first point; a fixed
"today" on a 31st (e.g. 2026-03-31 via `vi.useFakeTimers` +
`vi.setSystemTime`) gives 12 distinct consecutive months including February.
Update the existing test that expects today's exact date as the last point.
  files: tests/unit/services/WealthStatisticsService.test.ts
  depends: TASK-1
  risk: low — pure unit tests; restore real timers in `afterEach` so the
  other tests (which use `new Date()`) aren't affected.

TASK-3: Add the four range labels (en only) plus their type keys:
1 year / 3 years / 5 years / All.
  files: src/lib/types/translation.ts (`FinanceRecords`), src/lib/i18n/en.ts
  depends: none
  risk: low — `npm run check` fails until TASK-7 fills the other locales,
  so TASK-3 and TASK-7 must land together before review.
  notes: keep labels short (e.g. `1Y`-style is too cryptic; "1 year",
  "3 years", "5 years", "All"). Suggested keys: `range_1y`, `range_3y`,
  `range_5y`, `range_all` in `finances`.

TASK-4: Make `StackedAreaChart` redraw when `xCategories` / `dataPoints`
change, the same way `SmoothLineChart` does (an effect that calls
`createChart()` whenever its inputs change, disposing the previous
instance). This replaces the non-reactive `isInitialized` guard and the
duplicate `onMount` + `tick` initial draw.
  files: src/lib/components/charts/StackedAreaChart.svelte
  depends: none
  risk: medium — the chart is shared code, and an effect that redraws must
  not loop or double-initialise (STANDARDS 5.3/5.4). `chartContainer` must be
  `$state` (as in `SmoothLineChart`) for the effect to see it. Check whether
  it is used anywhere besides the wealth page before changing it.

TASK-5: Overview page: add a `SegmentedControl` range selector (default
1 year) to the wealth trend card and pass the selected range to
`getGraphValues()`.
  files: src/routes/finances/+page.svelte
  depends: TASK-1, TASK-3
  risk: low — local `$state` for the range, read inside the existing
  `$derived.by`. No persistence, nothing shared.
  notes: `SegmentedControl` works with string values, so convert to and from
  the service's range type in one place. Drop the needless `as unknown as`
  cast on `getGraphValues()` only if it's touched anyway. Don't refactor
  beyond that.

TASK-6: Wealth page: add one `SegmentedControl` range selector (default
1 year) to the history section. It drives both the trend and the composition
chart through the shared `statistics`.
  files: src/routes/finances/wealth/+page.svelte
  depends: TASK-1, TASK-3, TASK-4
  risk: low — same pattern as TASK-5. Its own `$state`, independent of the
  overview.

TASK-7: Hand the four new keys to the `translator` agent for de, es, fr, it
and ru (rules in `docs/I18N.md`, agent in `docs/agents/translator.md`).
  files: src/lib/i18n/{de,es,fr,it,ru}.ts
  depends: TASK-3
  risk: low — mechanical. `npm run check` verifies that the locale files
  match.

TASK-8: Check that "all" stays readable on a phone (many monthly points and
labels) on both pages. Only if labels overlap or crowd, set explicit
x-axis label thinning (`axisLabel.interval` / `hideOverlap`) in the two chart
wrappers.
  files: src/lib/components/charts/SmoothLineChart.svelte,
  src/lib/components/charts/StackedAreaChart.svelte (only if needed)
  depends: TASK-5, TASK-6
  risk: low — echarts' default `'auto'` interval probably already thins
  labels. This needs a render (render report / manual check), not code,
  unless it fails.

## Verification (from brief)

- `npm test`, `npm run check`, `npm run lint` pass.
- With wealth values going back 3+ years: "3 years" on the overview shows
  36 months ending with the current one; "all" starts at the earliest value;
  changing the range on the wealth page doesn't change the overview; both
  wealth-page charts follow the selector.
- With today set to a 31st, no month is missing or doubled (covered by
  TASK-2).
