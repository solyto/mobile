# Tasks: 09 Session monitor and ApiService follow-ups

id: relative
analyst: @analyst
date: 2026-10-13

<!-- Produced by @analyst from brief.md. -->

Branch checked: the worktree HEAD is `feature/relative_09-session-monitor-and-apiservice-follow-ups`, which matches `brief.md`.

Rules: STANDARDS 5.6, 10.1, 11.4, 11.5, 15.3. Out of scope: any change to
recovery semantics (retry-once, transient vs rejected). Every existing test in
`tests/unit/auth/*` and `tests/unit/services/ApiService.test.ts` must keep
passing unchanged in meaning.

The brief asks for **tests first**, so every task below starts by adding or
extending a test that fails on the current code (or pins current behaviour
before a refactor). Only then is the implementation changed.

## Open questions (read before starting)

1. **`ManageWeatherCity.svelte` is BLOCKED. Do not touch it in this job.**
   Its `fetch` goes to `https://nominatim.openstreetmap.org/search`, a
   third-party service, not the solyto API. If it went through the shared
   `ApiService`, the user's Bearer token would go to OpenStreetMap
   (`getApiHeader()` always adds `Authorization` when a token exists). A
   third-party 401 could also trigger the session recovery. Someone has to
   pick one of these:
   (a) record it in 15.3 as a second accepted direct call, next to the setup
   health check;
   (b) add a tokenless `ApiService` method that never runs recovery, and move
   the URL into config;
   (c) proxy it through the backend.
   The owner decides; this list does not guess. So this job covers 4 of the
   5 direct `fetch` calls named in the brief.
2. **`ExportSettings` download `Accept` header.** The current call sends
   `Accept: application/zip`. The plan reuses the existing
   `ApiService.image(endpoint)` (GET → `Blob | null`), which sends
   `Accept: application/json`. That should be harmless: a download response
   doesn't depend on `Accept`, and the component only checks ok/not ok. But
   this is an assumption about the backend that can't be checked from this
   repo. If the owner wants the header kept, TASK-9 needs a new
   `ApiService` method instead (the backlog entry allows "add the needed
   method"). A blob reader named `image()` that returns a zip is also a
   naming wart. It is noted here, not fixed.
3. **Where `SessionMonitor` lives.** It is not a context store (no
   `setContext`; `Auth` owns it), so 11.1's "context store" shape doesn't
   apply. The proposal is `src/lib/state/SessionMonitor.ts`, a plain class
   next to its only owner. `services/` holds pure services and `ApiService`,
   and a class with DOM listeners doesn't fit there. The reviewer may
   overrule this.

## Task breakdown

TASK-1: Add tests that pin how `ApiService.fetchWithRecovery` rebuilds headers on the retry, for every header shape (JSON body, no body, auth-only/FormData, and token cleared to null during recovery).
  files: tests/unit/services/ApiService.test.ts
  depends: none
  risk: low — tests only. The existing `401 recovery` block (lines ~245–300) covers just the JSON GET case.

TASK-2: In `ApiService`, rebuild the retry headers by calling the same header function the request was built with (e.g. `fetchWithRecovery` takes a header builder, or `init` minus headers plus a `() => HeadersInit`). This removes the `init.headers as Record<string, string>` cast. Also strip the narrating comments above `setUnauthorizedHandler` and on `fetchWithRecovery`, keeping only its "network errors propagate; never trigger recovery/logout" why-line and the `AUTH_ENDPOINTS` note (10.1).
  files: src/lib/services/ApiService.ts
  depends: TASK-1
  risk: medium — every public method's call into `fetchWithRecovery` changes (about 14 call sites). One wrong header builder silently changes `Content-Type`. Mitigated by TASK-1 plus the existing header tests. Do not change the existing `Bearer null` behaviour of `getAuthHeaderOnly()`; that is out of scope.

TASK-3: Make the refresh-response unwrap in `Auth.performRefresh` read as one explicit step, not `res.data?.data as LoginResponse`. `postWithStatus` returns `{ data: PostResponse }` and `PostResponse.data` is the payload, so name or destructure the envelope. Recovery semantics stay the same; first confirm the existing `refresh` tests still describe the response shape correctly.
  files: src/lib/state/Auth.svelte.ts (maybe the `postWithStatus` return shape in src/lib/services/ApiService.ts, only if renaming the field is the clearer fix; its only caller is `Auth`), tests/unit/auth/Auth.test.ts
  depends: none
  risk: low — one line and one caller. It is unclear whether "fix" means rename or just unwrap safely. Pick the smallest change that drops the optional chain on a value that `res.ok` already guarantees.

TASK-4: Write tests for a new `SessionMonitor` class (it doesn't exist yet). Cover: start registers `visibilitychange` and `online` and starts the interval while visible; hidden stops the interval; visible runs the check and restarts the interval; `online` runs the check; `destroy()` removes both listeners and clears the interval, and is safe to call twice. Stub `document`/`window`/timers (`vi.useFakeTimers`, `vi.stubGlobal`) because the unit project runs in `node`.
  files: tests/unit/auth/SessionMonitor.test.ts (new)
  depends: none
  risk: low — tests only. The test needs a `$app/environment` `browser` mock, or the class must take the `browser` decision from its owner (see TASK-5).

TASK-5: Extract `startSessionMonitor`/`startSessionCheckInterval`/`stopSessionCheckInterval`, the three handler fields and `SESSION_CHECK_INTERVAL_MS` from `Auth` into `SessionMonitor`. It gets a check callback, and `Auth` passes `() => this.validateSession()`. Collect the cleanups like `Viewpoint` does, and give it `destroy()` (11.4, 11.5). `validateSession` itself stays in `Auth` because it uses `refresh`/`logout`/`loadAdditionalData`/`shouldRefresh`.
  files: src/lib/state/SessionMonitor.ts (new, see open question 3), src/lib/state/Auth.svelte.ts
  depends: TASK-4
  risk: medium — the resume/online/interval behaviour must stay the same, including "don't start the interval while hidden" and the `browser` guard that keeps the tests and SSR from touching `document`.

TASK-6: Add `Auth.destroy()`, which calls the monitor's `destroy()`. Call `auth.destroy()` from an `onDestroy` in the root `+layout.svelte`, as 11.4 requires (`Viewpoint` reference). Write the test first in `Auth.test.ts`: after `destroy()`, the monitor no longer reacts, i.e. no further `validateSession` calls.
  files: src/lib/state/Auth.svelte.ts, src/routes/+layout.svelte, tests/unit/auth/Auth.test.ts
  depends: TASK-5
  risk: low — the root layout practically never unmounts, so the runtime effect is close to zero. Don't add a `viewPoint.destroy()` call too; that is a separate gap and not in the brief.

TASK-7: Expose session expiry as an event from `Auth`, e.g. `setSessionExpiredHandler(fn)` like `ApiService.setUnauthorizedHandler` (5.6). Fire it only from the two places that end a session non-voluntarily: the `rejected` branch in `performRecovery` and in `validateSession`. Never fire it from a user `logout()`. Tests first in `Auth.test.ts`: the handler fires once on a 401-rejected recovery, once on a rejected resume check, and not on a transient failure, an offline rejection or an explicit `logout()`.
  files: src/lib/state/Auth.svelte.ts, tests/unit/auth/Auth.test.ts
  depends: TASK-5 (both edit the same region of `Auth`; do them in order to avoid conflicts)
  risk: medium — the place it fires must not change when logout happens. That is recovery semantics, which is out of scope.

TASK-8: In the root layout, delete the `wasLoggedIn` variable, its comment and the whole `$effect` (and with it the `if (!browser) return` guard). Register the session-expired handler from TASK-7 instead: show `notifications.error(ts.get.auth.session_expired)` and `goto` setup or login based on `featureConfig.firstStartupOptions`, skipping the redirect when already on an auth or setup route. That keeps today's behaviour.
  files: src/routes/+layout.svelte
  depends: TASK-7
  risk: medium — this is the user-visible redirect after session expiry, and there's no component test for it. Check by reading the code, plus `npm run check`. `browser` is still used in the markup, so keep the import.

TASK-9: Route the `ExportSettings` download through the shared instance. Replace `new ApiService(auth.getToken())` with `auth.apiService`, and replace the raw `fetch` in `downloadExport` with `auth.apiService.image(apiRoutes.export.download.replace('%s', …))`, treating `null` as the failure path. Tests first: if `ApiService.image()` has no URL/headers assertion yet, add one in `ApiService.test.ts` (components aren't unit-tested here).
  files: src/lib/components/settings/ExportSettings.svelte, tests/unit/services/ApiService.test.ts
  depends: TASK-2 (open question 2 must be accepted, or this task grows a new `ApiService` method)
  risk: medium — the `Accept` header changes from `application/zip` to `application/json` (open question 2).

TASK-10: Route the three `Calendars` DELETE calls through `this.apiService.delete` using the existing pattern (pre-replace `%d`, pass the last `%s` value as the id, as `deleteEvent`/`detachTodo` do). `deleteOccurrence`: pre-replace `%d` and the first `%s` (uri), then pass the encoded occurrence date. `revokeShare`: pre-replace `%d`, pass `userId`. `unsubscribeFromCalendar`: `delete(apiRoutes.calendars.unsubscribe, calendarId)`. Tests first in `tests/unit/stores/Calendars.test.ts`: assert the `api.delete` URL/id for each call and the `loadEvents`/`loadCalendars` reload on success.
  files: src/lib/state/Calendars.svelte.ts, tests/unit/stores/Calendars.test.ts
  depends: none
  risk: low — no new `ApiService` method is needed. Side effect: these three calls now get 401 recovery, which is intended (15.3). `this.auth` stays because it's still read at lines ~84 and ~180.

TASK-11: In the seven remaining components, replace `new ApiService(auth.getToken())` with `auth.apiService` and drop the then-unused `ApiService` import. The components: `settings/notifications/ManageNotificationTypes.svelte`, `settings/notifications/ManagePushNotifications.svelte`, `settings/notifications/ManageBotNotifications.svelte`, `settings/TelegramBotConnection.svelte`, `dashboard/Inspiration.svelte`, `calendars/ShareCalendarModal.svelte`, `libraries/shared/Recommender.svelte`. `ExportSettings` is the eighth and is done in TASK-9.
  files: the 7 components listed above
  depends: none
  risk: low — the change is mechanical and the method calls stay the same. There's no component test seam, so verify with `npm run check`, `npm run lint` and `grep -rn "new ApiService(" src` (the only hit left should be `Auth`). Known but out of scope: `Recommender.svelte:61` builds a URL with a template string, which also breaks 15.3. Leave it.

TASK-12: Strip the remaining narrating comments in `Auth.svelte.ts` (10.1): the constructor note, the `clear()` note, `// Single-flight: …`, the `performRefresh` 5xx note if it only restates the return line, the `(a)/(b)/(c)` ladder, the JSDoc on `recoverFromUnauthorized` and `validateSession`, and the `catch` notes. Where 10.1 asks for it, turn the lettered ladder into named calls. Decide on the `RefreshOutcome` union comment and the `SESSION_CHECK_INTERVAL_MS` comment (now in `SessionMonitor`) with the same rule: keep only a why the code can't express.
  files: src/lib/state/Auth.svelte.ts, src/lib/state/SessionMonitor.ts, src/lib/services/ApiService.ts (the `postWithStatus` comment, if TASK-2 didn't already decide it)
  depends: TASK-3, TASK-5, TASK-6, TASK-7 (do this last on these files so it doesn't conflict)
  risk: low — comments only, plus restructuring the ladder into named calls. Re-run the `recoverFromUnauthorized` tests to confirm the ladder order didn't change.

## Final verification (after all tasks)

- `npm test`, `npm run check`, `npm run lint` are green.
- `grep -rn "new ApiService(" src` → only `src/lib/state/Auth.svelte.ts`.
- `grep -rn "fetch(" src --include=*.ts --include=*.svelte` → only
  `ApiService.ts`, `service-worker.ts`, `routes/setup/+page.svelte` (accepted)
  and `weather/ManageWeatherCity.svelte` (blocked, open question 1).
- `grep -rnE '^\s*(//|<!--|/\*)' src/lib/state/Auth.svelte.ts src/lib/state/SessionMonitor.ts src/lib/services/ApiService.ts src/routes/+layout.svelte`
  → only the two why-comments 10.1 keeps, plus any the reviewer accepts as an external constraint.
- After the merge, tick off the matching entries in `docs/STANDARDS_BACKLOG.md` (lines ~82–96, ~112). Leave the `ManageWeatherCity` part open.
