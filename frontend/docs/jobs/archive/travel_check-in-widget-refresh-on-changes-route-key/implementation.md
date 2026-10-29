## Summary

Check-in changes now trigger a widget refresh, and the widget bridge accepts a `check_in` route key that opens the check-in page. Mobile only; `notifyChanged()` does nothing off mobile.

## Changes

TASK-1: `src/lib/state/CheckInData.svelte.ts`: `save()` calls `this.auth.widgetBridge.notifyChanged()` after the `if (!ok) return false;` guard.
TASK-2: `src/lib/state/CheckInData.svelte.ts`: `saveSettings()` keeps the boolean from `apiService.put()` and notifies only when it is `true`. `this.settings = settings` still runs every time, and the return type is still `Promise<void>`.
TASK-3: `src/lib/state/WidgetBridge.ts`: new `check_in` branch in `navigate()` → `goto(resolve(urls.checkIn))`. Any id is ignored.
TASK-4: `tests/unit/stores/CheckInData.test.ts`: added notify/no-notify assertions to the `save` tests, a notify assertion to the `saveSettings` success test, and a new `saveSettings` failure test.
TASK-5: `tests/unit/widgets/WidgetBridge.test.ts`: test that `check_in` navigates to `/check-in`.

## Known issues / follow-ups

- `node_modules` is not installed in this session, so `npm test`, `npm run check` and `npm run lint` could not be run. They need to be run before merging.
- `docs/backlog/widget-refresh-on-check-in-changes.md` duplicates this job. I did not remove it; that is up to the owner.
