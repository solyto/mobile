# Backlog: check-in History: tracker heatmap and day modal

created: 2026-11-03

## What

Replace the History month grid, which shows every tracker for every day
(`components/check-in/overview/OverviewDesktop.svelte` / `OverviewMobile.svelte`),
with a view of one tracker at a time. Make past days editable without leaving
the page.

- The user picks a tracker and sees a calendar heatmap of its values, similar
  to GitHub's contribution graph. Each day's colour comes from its value.
- Tapping a day opens that day's full check-in in a modal, with previous/next
  day arrows so several past days can be filled in one after the other. On
  mobile the modal is a bottom or full-screen sheet. Reuse the app's existing
  modal component.
- The averages and summaries sidebar (`Averages`, `CheckInSummaries`) stays as
  it is.

## Why

The grid is dense and hard to read in either direction. Editing an old entry
currently means leaving History and coming back each time.

## Out of scope

- Merging History and Trends. This is deliberately postponed: look at it again
  once this has shipped.
- Changes to Trends or to the sidebar.
- Custom counters (`check-in-custom-counters.md`). The heatmap should be easy
  to reuse for them later: numbers with no upper limit, shaded relative to the
  user's maximum.

## Notes

- The modal shows the same day form as `/check-in/date/[date]`.
  `check-in-today-sections-and-reorder.md` pulls that form out into a
  component, so coordinate with it or do it here if that job hasn't happened
  yet.
- The day page currently reads its date from the URL through `CheckInData`
  (`selectedDate`, `getDayData()`). The modal needs to work with a date passed
  in instead.
- The `/check-in/date/[date]` route stays for Today and for direct links.
- Undecided: which tracker is selected by default, and whether the choice is
  remembered.
