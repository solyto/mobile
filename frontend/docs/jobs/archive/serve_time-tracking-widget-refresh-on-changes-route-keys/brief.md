# Brief: time tracking widget: refresh on changes, route keys

type: feature
id: serve
branch: feature/serve_time-tracking-widget-refresh-on-changes-route-keys
date: 2026-10-29
author: Leander Muskalla

## What

Prepare the app for the Android time tracking widget:

1. Tell the widgets to refresh after time tracking changes.
2. Open time tracking pages from widget taps.

Mobile only, through the existing widget bridge
(`src/lib/state/WidgetBridge.ts`); web and desktop are unaffected.

## Why

The widget shows the running timer and the user's projects. When the user
starts or stops a timer, or edits projects, in the app, the widget should
show it straight away, not at its next hourly fetch. Widget taps on a timer
or project row should open that project.

## Steps

1. **Refresh:** call `this.auth.widgetBridge.notifyChanged()` after every
   successful mutation in `src/lib/state/TimeTracking.svelte.ts`:
   `startTimer`, `stopTimer`, `createEntry`, `updateEntry`, `deleteEntry`,
   `createProject`, `updateProject`, `deleteProject`. Categories do not show
   on the widget: no refresh for them. `notifyChanged()` is already
   debounced and a no-op off mobile.
2. **Route keys** in `WidgetBridge.navigate()`, next to `todo` and
   `calendar`:
   - `time_tracking` (no id): the time tracking page (`urls.timeTracking`);
   - `time_tracking_project` + id: that project's page
     (`urls.timeTrackingProject`, `/time-tracking/<id>`). Validate the id as a
     UUID, like `todo`. Unknown keys and bad ids stay ignored.
3. **Tests** (vitest): each mutation above notifies (and a failed one does
   not); categories do not; `navigate` with both new keys, including a bad
   id.

## Out of scope

- The widget itself (`solyto/mobile`) and its API (`solyto/api`).
- Any visible change in the app.

## Notes

- These route keys are part of the cross-repo contract: the API sends them in
  `route.key`, and native passes them through unchanged. Keep exactly
  `time_tracking` and `time_tracking_project`.
