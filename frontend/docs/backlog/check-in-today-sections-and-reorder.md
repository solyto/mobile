# Backlog: check-in Today: sections, reorder and smaller icons

created: 2026-11-03

## What

The daily check-in view (`src/routes/check-in/date/[date]/+page.svelte`) is a
single long list of tracker rows with very large icons. Give it structure so it
stays easy to scan as more trackers are added.

- Group the trackers into sections (e.g. Body, Mind). Sections can be
  collapsed by the user and stay as the user left them. They never collapse
  automatically: values are often changed later in the day.
- Let the user reorder trackers in the check-in settings
  (`components/check-in/CheckInSettings.svelte`). Turning trackers on and off
  already exists. Today and History both follow the chosen order.
- Make the icon buttons smaller. They are 88px (`size-22` in
  `daily/DailyCheckInIcon.svelte`). Around 56px on desktop, and no smaller than
  about 44px on mobile so they stay easy to tap.

## Why

The Today view already feels crowded and will get worse once custom counters
arrive (`check-in-custom-counters.md`).

## Out of scope

- Collapsing rows that are already filled in. This was rejected because values
  change during the day.
- History and Trends (see `check-in-history-heatmap-and-day-modal.md`).
- User-defined sections. The sections are fixed.

## Notes

- Undecided: the exact sections and which tracker goes where. Propose a
  grouping and confirm it with the maintainer before building.
- The order needs to be stored next to `enabled_trackers` in the user's
  check-in settings. That needs an api change: `UpdateCheckInSettingsRequest`
  and the settings resource. Whether `enabled_trackers` can simply become an
  ordered list is for the developer to judge.
- Pull the day form out of the route into a component, so that
  `check-in-history-heatmap-and-day-modal.md` can show it in a modal.
- All new strings in `en`, the other locales through the translator agent.
