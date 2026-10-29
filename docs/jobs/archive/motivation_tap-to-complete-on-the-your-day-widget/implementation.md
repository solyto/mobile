# Implementation: tap-to-complete on the "Your Day" widget

id: motivation
developer: @developer
date: 2026-10-29

## Summary

Todo rows with `action: { type: "check", key, checked? }` now show a checkbox
on the Your Day widget. A tap goes to a new non-exported receiver. The
receiver validates the tap, shows the row as done right away and enqueues one
WorkManager job per row. That job posts `POST /api/v1/widgets/actions/{key}/{id}`
with the widget token and applies the brief's status table. Native has no
per-key code: any key that matches the format is posted as-is.

**Not built or device-tested.** This environment has no JDK and no Android
SDK, so `./gradlew assembleDebug` could not run (TASK-9). None of the manual
checks have been done. Please build it and run the checks below before merging.

## Changes

TASK-1 (`YourDayPayload.java`): parses the row `id` and `action`. The action
is kept only when `type` is `check`, `key` matches `[a-z][a-z0-9_.-]*`
(≤ 64 chars) and the id is valid. Otherwise the row has no control. Adds the
shared validators `isValidActionKey`/`isValidRowId` and `findAction(type, key, id)`.

TASK-2 (`WidgetApi.java`): `postAction()` sends a POST with `Content-Length: 0`
and the same headers, with redirects off. It re-validates key and id and maps
200→OK, 401→UNAUTHORIZED, 403/404→NOT_FOUND, 426→UPGRADE_REQUIRED, and
anything else or an exception→TEMPORARY_FAILURE. The connection setup moved
into a shared `open()`; `fetchYourDay` behaves the same as before.

TASK-3 (`WidgetCache.java`): adds `action_rows`, a JSON map from row id to
either the call's start time (running) or minus its finish time (done, waiting
for the re-fetch), and an `action_error` flag. `startAction` returns false when
the row is already active, which is how repeated taps get ignored. A
successful `saveData` drops the finished entries and the error flag, and
`clear()` wipes both. Entries older than 5 minutes are dropped, so a cancelled
job or a failed re-fetch cannot leave a row stuck as done. Deviation from the
task text: `saveData` keeps entries whose call is still running, so a periodic
fetch that lands mid-call does not briefly uncheck the row.

TASK-4 (`WidgetActionReceiver.java` (new), `YourDayWidgetProvider.java`,
`AndroidManifest.xml`): the list's click template is now a mutable, explicit
**broadcast** to `WidgetActionReceiver` (`exported="false"`). For check taps,
the receiver validates the type, key and id, and requires that the cached
payload holds that row with that action, not already checked. It then calls
`startAction`, re-renders and enqueues the job. Route taps are forwarded to
`MainActivity` (`ACTION_WIDGET_ROUTE` + the existing extras,
`FLAG_ACTIVITY_NEW_TASK`), which keeps validating them as before.
**Manifest change: please review.**

TASK-5 (`WidgetActionWorker.java` (new), `WidgetWork.java`): `runAction()`
enqueues unique work `widget-action-<id>` with `KEEP`. The input data is only
the key and id; the worker reads the token and URL from `WidgetTokenStore`. The
outcomes are:
- OK/404: the row stays done and `fetchNow` runs.
- 401: `clearIfCurrent` + `WidgetCache.clear`.
- 426: revert + `UPDATE_APP`.
- Anything else: revert + the error flag.

No retry in any case. If the token changes mid-call, the row is reverted
silently. `cancelAll` also cancels action work, by tag.

TASK-6 (`layout/widget_your_day_row.xml`, `layout-v31/widget_your_day_row.xml`
(new), `drawable/ic_widget_check_on.xml` (new), `YourDayWidgetProvider.java`):
- On API 31+, rows use a real `CheckBox` with `setCompoundButtonChecked` and
  `setOnCheckedChangeResponse(RemoteResponse.fromFillInIntent(...))`. Checked
  rows are disabled.
- On 24–30, rows use a tappable `ImageView`. Unchecked reuses
  `ic_widget_todo` (the circle); checked uses the new filled circle-check.
- The control is checked when the server says `checked` or the row's action
  is active, and every render sets the state explicitly, so reverts undo the
  launcher's local toggle.
- The fill-in is always set, and the unused icon or checkbox is hidden
  explicitly, so a recycled list view never keeps another row's intent or
  control. The receiver ignores taps on checked or active rows.
- Action rows show the checkbox in place of the todo icon.

TASK-7 (`YourDayWidgetProvider.java`): while the error flag is set, the
header's "Updated …" line shows `widget_action_failed`. The flag clears on
the next successful fetch or the next tap. No layout change was needed.

TASK-8 (`values`, `values-de/fr/es/it` `strings.xml`): adds
`widget_action_failed` and `widget_action_check` (the content description).
No notification strings were needed (see below).

TASK-9: not done. There was no toolchain, so nothing was built, and the
manual checks are still open:

| Check | Status |
|---|---|
| `./gradlew assembleDebug` | not done (no JDK/SDK here) |
| Complete a todo, API 24 | not done |
| Complete a todo, API 34+ | not done |
| Complete a recurring todo (next occurrence appears if due) | not done |
| Airplane mode → revert + error | not done |
| Todo deleted in the app meanwhile → row disappears | not done |
| Double tap → one call | not done |
| Complete in widget, then open app → shown completed | not done |
| **Row tap → opens route, API 24 / 31 / 35+ (regression)** | not done |

Rework after review: a rejected check tap (row not in the cache, state not
OK, already checked or already running) now re-renders the widget, so the
launcher's local CheckBox toggle on API 31+ is undone.
(`WidgetActionReceiver.java`)

Rework round, still blocked: this environment still has no JDK, Android SDK
or emulator, so the build, the row-tap regression on API 24/31/35+ and the
step 6 checks remain open. They need a human with an Android toolchain.

## Decisions / assumptions

- **Open question 1 (trampoline): unverified.** Row taps now go
  launcher → broadcast → receiver → `startActivity(MainActivity)`. I expect
  this to work: the widget host sends the click while it is visible, and a
  broadcast `PendingIntent` sent that way gives the receiving process a short
  background-activity-start window. On API 34+ that depends on the host
  allowing BAL when it sends the `PendingIntent`, which the framework's
  default RemoteViews click handling does. I could not check this on a
  device. If row taps fail to open the app on 35+, the design needs a human
  decision, as the analyst noted.
- **Open question 2 (expedited below 31):** the job is expedited only on
  API 31+. Below 31 it is normal one-time work with no constraints, which
  usually runs right away. This avoids a foreground-service notification,
  its channel and its strings. It is a deliberate reading of the brief's
  "expedited": please confirm.
- **Open question 3 (id format):** row ids must match `[A-Za-z0-9-]{1,64}`,
  which is path-segment safe and covers UUIDs. Rows with other ids (or a
  numeric JSON id) get no checkbox.
- 403 on an action is treated like 404, as the brief says: the row stays done
  and a re-fetch follows.

## Known issues / follow-ups

- The build and all manual checks are still outstanding (see TASK-9).
- Existing, not changed: `itemView` only *shows* the optional subtitle, time
  and icon. Since the list reapplies item views to recycled views, a row
  without a subtitle could in theory keep a recycled row's subtitle. Worth
  checking during the manual tests. The new checkbox and icon handling hides
  them explicitly.
