# Verdict: check-in widget: refresh on changes, route key

id: travel
reviewer: reviewer
date: 2026-10-29

## Review

TASK-1: PASS
notes: `CheckInData.save()` notifies after the `if (!ok) return false;` guard, before reloading. It does not notify on failure.

TASK-2: PASS
notes: `saveSettings()` keeps the `boolean` from `apiService.put()` and notifies only when it is `true`. `this.settings = settings` still runs every time, and the return type is still `Promise<void>`. Callers are unchanged.

TASK-3: PASS
notes: `WidgetBridge.navigate()` has a new `check_in` branch that calls `goto(resolve(urls.checkIn))`, and `urls.checkIn` is `'/check-in'`. Any id is ignored and unknown keys still do nothing. The key string is exactly `check_in`.

TASK-4: PASS
notes: The existing `save` tests now assert notify on success and no notify when the API returns `null`. The `saveSettings` success test asserts notify, and a new failure test (`put` resolves `false`) asserts no notify. The mock is reset in `resetStoreMocks()`.

TASK-5: PASS
notes: `{ type: 'navigate', key: 'check_in' }` → `goto('/check-in')`. It mirrors the `calendar` test.

Scope: the diff touches only the four files listed in the plan and the job docs. Nothing outside the plan changed.

Verification: `node_modules` is not installed in this environment, so I could not run `npm test`, `npm run check` or `npm run lint`. I checked the changes by reading the code against `ApiService.put` (`Promise<boolean>`), `ApiService.create` (`CreateResponse | null`), the `storeMocks` auth mock, and the `resolve` mock in `WidgetBridge.test.ts`.

## Security

Not run.

## Overall

APPROVED
