# Brief: check-in widget: refresh on changes, route key

type: feature
id: travel
branch: feature/travel_check-in-widget-refresh-on-changes-route-key
date: 2026-10-29
author: Leander Muskalla

## What

Prepare the app for the Android check-in widget:

1. Tell the widgets to refresh after check-in changes.
2. Open the check-in page from widget taps.

Mobile only, through the existing widget bridge
(`src/lib/state/WidgetBridge.ts`); web and desktop are unaffected.

## Why

The widget shows today's check-in and the enabled trackers. When the user
checks in or changes their check-in settings in the app, the widget should
follow straight away, not at its next hourly fetch.

## Steps

1. **Refresh:** call `this.auth.widgetBridge.notifyChanged()` after a
   successful `save()` (today's or any day's check-in) and a successful
   `saveSettings()` (enabled trackers and selected sports change the widget's
   rows) in `src/lib/state/CheckInData.svelte.ts`. Check how `saveSettings`
   reports success and notify only then. `notifyChanged()` is already
   debounced and a no-op off mobile.
2. **Route key** in `WidgetBridge.navigate()`, next to the existing keys:
   `check_in` (no id) → the check-in page (`urls.checkIn`, which already
   redirects to today's date). Unknown keys and ids stay ignored.
3. **Tests** (vitest): `save` and `saveSettings` notify on success and not on
   failure; `navigate` with `check_in`.

## Out of scope

- The widget itself (`solyto/mobile`) and its API (`solyto/api`).
- Any visible change in the app.

## Notes

- The route key is part of the cross-repo contract: the API sends it in
  `route.key`, and native passes it through unchanged. Keep exactly
  `check_in`.
