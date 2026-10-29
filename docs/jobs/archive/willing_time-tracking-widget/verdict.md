# Verdict: time tracking widget

id: willing
reviewer: @reviewer
date: 2026-10-29

## Review

Reviewed `git diff main...HEAD` on `feature/willing_time-tracking-widget`.
There are no `frontend/` edits, and `WidgetBridge.ts` handles
`time_tracking` / `time_tracking_project` (lines 148–151). The diff matches
implementation.md, with no unlisted changes. Every changed XML file is
well-formed. There is no JDK or Android SDK here, so this review is static only.

TASK-1: PASS
notes: `WidgetPayload` reads `live` == "elapsed", `at` (via `IsoTime.parse`,
which returns -1 for null or invalid input), strict `#RRGGBB` → opaque ARGB
(black maps to 0xFF000000, so it does not collide with `NO_COLOR` = 0), and
the `timer` icon. It also reads the `button` action, but only with `play`/`stop`
and only with a valid key and row id. Both `Item` call sites are updated.
`findAction` works for button rows because `id` and `actionKey` are always set
together with `actionType`.

TASK-2: PASS
notes: `YourDayWidgetProvider` binds the checkbox only for `check`.
`iconResource("timer")` returns 0, so Your Day hides the icon. Your Day's
rendering is otherwise unchanged.

TASK-3: PASS
notes: The receiver accepts `button` actions. The `actionChecked`
short-circuit now applies only to `check`. All existing validation is kept:
key/id format, state OK, the row must be in the cached payload with the same
type/key/id, and `startAction` rejects busy rows.

TASK-4: PASS
notes: `TIME_TRACKING("time-tracking", …, "running", "projects")` is
registered. With no `refresh_at`, `refreshAt` is -1, so nothing is scheduled.

TASK-5: PASS
notes: The play/stop/timer vectors are the project's own. The dot is white and
tinted at runtime. `widget_running` has light and dark values.

TASK-6: PASS
notes: Header and message open the app. Section and row view types are used.
Each row sets its subtitle, dot tint (color or accent), highlight, timer icon,
chronometer (base `elapsedRealtime() - max(0, now - at)`), button
image/content description/alpha/enabled, and fill-ins, so recycled views carry
no stale state. The state logic mirrors Your Day, and the action error shows in
the "updated" slot. Request codes 3/4 don't clash with Your Day's 1/2. Using
its own section layout instead of reusing Your Day's is justified (aligned
inset), and it leaves Your Day untouched.

TASK-7: PASS
notes: The provider XML has a description, a preview layout plus a drawable
fallback, is resizable, and defaults to 3×2. The receiver is `exported="false"`.

TASK-8: PASS
notes: Strings are added in values plus de/fr/es/it. The extra
`widget_time_tracking_failed` string goes against the tasks' default "reuse"
assumption, but it is flagged and justified: the German "Abhaken fehlgeschlagen"
is wrong for start/stop. Translations need a translator check, as flagged.

TASK-9: PARTIAL
notes: `./gradlew assembleDebug`, lint and all the manual checks from brief
step 7 were not run, because this environment has no JDK or SDK. The
implementation notes say so plainly. A static check found no compile problems:
every import is used, every RemoteViews method used is remotable, and every
referenced resource exists.

## Security

Not run separately. The untrusted fill-in path keeps all its existing checks.
The only new accepted action type is `button`, and it is still validated
against the cached payload.

## Overall

APPROVED (code). No code changes are required.

Before merging, a human with an Android toolchain must:
- run `cd android && ./gradlew assembleDebug` (plus lint) and confirm it builds;
- run the manual checks from brief step 7. In particular: `Chronometer` and
  `setImageAlpha`/`setEnabled`/`setColorFilter` inside `RemoteCollectionItems`
  on API 24 and 34+, and the picker preview on Android 12+.
