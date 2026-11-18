# Implementation: choose the time range of the wealth charts

id: contact
developer: developer
date: 2026-11-17

## Summary

The wealth charts on the finances overview and the wealth page get a range
selector (1 year / 3 years / 5 years / All, default 1 year). Each page keeps
its own range in local `$state`; nothing is shared or persisted.
`getGraphValues()` takes the range and builds months from the 1st of the
month, which also fixes the month-end overflow bug (on the 29th–31st a month
went missing and another appeared twice).

## Changes

TASK-1: `src/lib/services/WealthStatisticsService.ts`. `getGraphValues(range: number | 'all')`.
Numeric ranges end at the current month. `'all'` starts at the month of the
earliest value of any field. If there are no values, or the earliest value is
in the future, it shows only the current month. Each point is dated the 1st of
its month (`new Date(y, m + i, 1)`). The carry-forward logic is unchanged,
but it now compares `YYYY-MM` strings instead of `new Date(v.date)` (UTC
parsing), so it doesn't depend on the timezone. Removed the dead `lastValues`.
The range options are defined once: `wealthRanges` (`1y: 12, 3y: 36, 5y: 60, all`),
along with the `WealthRange` and `WealthRangeKey` types.

TASK-2: `tests/unit/services/WealthStatisticsService.test.ts`. Added tests:
12, 36 and 60 points ending at the current month; a fixed today of 2026-03-31
gives 12 consecutive months including February; `'all'` starts at the earliest
value's month across fields; `'all'` with no values gives 1 point; a value from
before the range carries into the first point. Fake timers are reset in
`afterEach`. Updated the existing tests to the new signature and to the
`YYYY-MM-01` point date. Also fixed the test helper `monthsAgo`, which had the
same `setMonth` overflow.

TASK-3: `src/lib/types/translation.ts` and `src/lib/i18n/en.ts`. Added
`finances.range_1y`, `range_3y`, `range_5y` and `range_all`.

TASK-4: `src/lib/components/charts/StackedAreaChart.svelte`. The chart now
redraws when its data changes, the same way `SmoothLineChart` does:
`chartContainer` is `$state`, the effect calls `createChart()` (which disposes
the old instance), and the non-reactive `isInitialized` guard and the
`onMount` + `tick` initial draw are gone. The wealth page is its only user.

TASK-5 / TASK-6: new `src/lib/components/finances/WealthRangeControl.svelte`
(a `SegmentedControl` with the four labelled options, `bind:value` of
`WealthRangeKey`), so the two pages don't duplicate the options. Used in
`src/routes/finances/+page.svelte` next to the wealth trend heading. The
needless `as unknown as` cast is dropped there. Also used in
`src/routes/finances/wealth/+page.svelte` next to the "History" heading, where
it drives both the trend and the composition chart through `statistics`.

TASK-7: `src/lib/i18n/{de,es,fr,it,ru}.ts`. The `translator` sub-agent can't
be started from this session, so I applied its rules from `docs/I18N.md`
directly:

| key | de | es | fr | it | ru |
|---|---|---|---|---|---|
| range_1y | 1 Jahr | 1 año | 1 an | 1 anno | 1 год |
| range_3y | 3 Jahre | 3 años | 3 ans | 3 anni | 3 года |
| range_5y | 5 Jahre | 5 años | 5 ans | 5 anni | 5 лет |
| range_all | Alle | Todo | Tout | Tutto | Всё |

TASK-8: no code change. Both chart wrappers use an echarts category x-axis
with the default `'auto'` label interval, which hides overlapping labels. I
couldn't render it (see below), so it still needs a check on a phone.

## Known issues / follow-ups

- **Not run: `npm test`, `npm run check`, `npm run lint`.** The worktree has
  no `node_modules`, and installing packages needs approval. I checked the
  service logic with a scratch node script (type-stripped copy of the service)
  in UTC and America/New_York: 12/36/60 points ending at the current month,
  `'all'` from the earliest month (52 points for 2022-08 → 2026-11), carry-in
  from before the range, and consecutive months with today set to 2026-03-31.
  The results match the new test expectations. The type check, lint and the
  Vitest run itself still need to be done.
- TASK-8 render check (readability of "All" on a phone) is still open, for the
  same reason (no deps and no API to render against).
- `'All'` can be shorter than "1 year" if the earliest value is less than 12
  months old (the brief taken literally, as noted in tasks.md).

## Rework (after verdict: needs work)

1. Removed the redundant comment above `getFirstMonth()` in
   `WealthStatisticsService.ts` (STANDARDS 10.1).
2. `ru.ts` `finances.range_all` is now `'Всё время'`, matching the existing
   statistics `range_all`. There is still no way to start the `translator`
   sub-agent from this session, so I checked the other locales against its
   rules by hand: de/es/fr/it `range_all` already match their statistics
   `range_all`, and `1y/3y/5y` follow the neighbouring `range_3_months` style.
3. / 4. Still open: `npm test`, `npm run check`, `npm run lint` and the TASK-8
   phone render. The worktree has no `node_modules`, and installing them
   (`npm ci`) needs owner approval under the hard rules.
