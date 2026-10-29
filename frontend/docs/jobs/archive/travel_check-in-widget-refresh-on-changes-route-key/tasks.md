# Tasks: check-in widget: refresh on changes, route key

Branch verified: `feature/travel_check-in-widget-refresh-on-changes-route-key`.

## TASK-1: Notify widgets after a successful check-in `save()`

In `CheckInData.save()`, call `this.auth.widgetBridge.notifyChanged()` once
`apiService.create` has succeeded. This applies to today's check-in and to any
other day. Put the call after the `if (!ok) return false;` guard. Do not call
it on failure.

- Files: `src/lib/state/CheckInData.svelte.ts`
- Depends on: none
- Risk: low. It is one line and follows the existing `if (res) this.auth.widgetBridge.notifyChanged()` pattern in Todos, Calendars and TimeTracking.

## TASK-2: Notify widgets after a successful `saveSettings()`

`saveSettings()` currently ignores the boolean that `apiService.put()`
returns. Capture that result and call
`this.auth.widgetBridge.notifyChanged()` only when it is `true`.

Keep the rest of the current behaviour as it is:
- `this.settings = settings` still runs unconditionally.
- The return type stays `Promise<void>`.
- The callers in `CheckInSettings.svelte` stay unchanged.

The brief only asks to notify on success. Changing the local-state behaviour
on failure would be out of scope.

- Files: `src/lib/state/CheckInData.svelte.ts`
- Depends on: none
- Risk: low. The change is local, and existing callers ignore the return value.

## TASK-3: Add the `check_in` route key to `WidgetBridge.navigate()`

Add a branch `else if (key === 'check_in') void goto(resolve(urls.checkIn));`
next to the existing keys. It takes no id, and any id that comes with it is
ignored, the same as the `calendar` key. The key string must be exactly
`check_in`. Unknown keys keep falling through and do nothing.

- Files: `src/lib/state/WidgetBridge.ts`
- Depends on: none
- Risk: low. It is a new branch in an existing if-chain, and the key is fixed by the cross-repo contract.

## TASK-4: Tests for `CheckInData` notifications

In `tests/unit/stores/CheckInData.test.ts`, add tests that use
`auth.widgetBridge.notifyChanged` from `../setup/storeMocks`. It is already
reset in `resetStoreMocks()`.

- `save`: notifies once when `api.create` resolves truthy, and does not notify when it resolves `null`.
- `saveSettings`: notifies once when `api.put` resolves `true`, and does not notify when it resolves `false`.

- Files: `tests/unit/stores/CheckInData.test.ts`
- Depends on: TASK-1, TASK-2
- Risk: low. The mock infrastructure already exists (see `TimeTracking.test.ts` / `Todos.test.ts`).

## TASK-5: Test the `check_in` navigate key

In the `describe('navigate')` block of `tests/unit/widgets/WidgetBridge.test.ts`,
add a test showing that `{ type: 'navigate', key: 'check_in' }` calls `goto`
with `'/check-in'`. Follow the existing `calendar` test.

- Files: `tests/unit/widgets/WidgetBridge.test.ts`
- Depends on: TASK-3
- Risk: low. It mirrors the existing tests.

## Notes

- There are no UI strings and no visible changes, so no i18n work is needed.
- This brief duplicates `docs/backlog/widget-refresh-on-check-in-changes.md`.
  Whether that backlog entry gets removed as part of this job is up to the
  pipeline or owner. It is not listed as a task here.
- Verify with `npm test`, `npm run check` and `npm run lint`.
