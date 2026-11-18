# Brief: choose the time range of the wealth charts

type: feature
id: contact
branch: feature/contact_choose-the-time-range-of-the-wealth-charts
date: 2026-11-17
author: Leander Muskalla

## What

The time-based wealth charts always show the last 12 months. Add range
buttons, **1 year / 3 years / 5 years / all**, default 1 year, on both
pages that have such charts:

- the overview (`src/routes/finances/+page.svelte`): the wealth trend chart;
- the wealth page (`src/routes/finances/wealth/+page.svelte`): the trend and
  the history composition chart (both from the same `statistics`, `:30-32`).

The limit is only in the app: `WealthStatisticsService.getGraphValues()`
(`src/lib/services/WealthStatisticsService.ts`) builds exactly 12 months
(`startDate` minus 11 months, `for (let i = 11; …)`). The API already sends
each wealth field's full value history, so no API change is needed.

- **Service:** `getGraphValues()` takes the number of months to build, or
  "all". "All" starts at the month of the earliest value of any wealth
  field. Keep the existing carry-forward logic (a field's last value before
  the start, then the latest value per month).
- **Pages:** each page keeps its own range in component state. Not shared
  between the two pages, not remembered (back to 1 year on every visit).
- **i18n:** labels for the four ranges in all six locales (`src/lib/i18n/`),
  with the type in `src/lib/types/translation.ts`.
- **Tests:** extend `tests/unit/services/WealthStatisticsService.test.ts`:
  1, 3 and 5 years give 12, 36 and 60 points; "all" starts at the earliest
  value's month; a field's value from before the range is carried into the
  first point.

Also fix an existing month bug in the same loop. Months are computed with
`date.setMonth(date.getMonth() - i)` starting from today. On the 29th–31st
this overflows: on March 31, "one month back" becomes March 3, so February
is missing and March appears twice. Build the months from the first of the
current month instead, and add a test with a fixed "today" on the 31st.

## Why

Dev request: the overview only shows the past year; earlier data should be
reachable. Decided 2026-11-17: range buttons (not year navigation or free
dates), on the overview and the wealth page, each page with its own
choice, nothing remembered.

## Notes

- With "all" over many years, the charts get many monthly points and
  labels. Check that they stay readable on a phone; thinning the axis labels
  is enough if they don't.
- Independent of the budget entries; touches only wealth charts.
- Check: with wealth values going back 3+ years, "3 years" on the overview
  shows 36 months ending with the current one, "all" starts at the earliest
  value, and the wealth page's choice doesn't change the overview's. With the
  system date set to a 31st, no month is missing or doubled.
- You are allowed to run npm commands, e.g. npm ci