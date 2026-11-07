# Backlog: check-in custom counters

created: 2026-11-03

## What

Let users define their own counters in check-in, e.g. "Squats" in "reps" or
"Pages read" in "pages", enter any number per day, and see the counts in
History and Trends. This comes from a user dev request ("how many squats
today?").

- In the check-in settings: create, rename, delete, hide and reorder counters.
  Each counter has a name and a unit.
- Today: counters get their own section (see
  `check-in-today-sections-and-reorder.md`). Each row has the label, a number
  field, the unit, and +/− buttons.
- History: counters can be picked in the tracker heatmap
  (`check-in-history-heatmap-and-day-modal.md`), shaded relative to the user's
  maximum. The exact number shows on hover or tap.
- Trends: counters can be charted like the built-in trackers.

## Why

Users want to track things they count, like reps or pages, and see them
graphed. Today they can only write them in journal or notes, which gives no
graph.

## Out of scope

- Daily goals and progress.
- Durations and yes/no habits.
- Dashboard widget, Android widget and reminders.

## Notes

- Built-in trackers are fixed columns on `check_in` with values 1–5. Counters
  need their own api model: one table for the user's counters and one for the
  value per counter per day, plus endpoints. Don't add columns to `check_in`.
- Depends on both redesign entries for the UI.
- Undecided: the +/− step size (fixed 1, or per counter), and whether counters
  go into the export (`CheckInExportService`). Probably yes.
- All new strings in `en`, the other locales through the translator agent.
