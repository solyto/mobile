# Tasks: widget foundation: support several widget kinds

id: eat
analyst: @analyst
date: 2026-10-29

<!-- Produced by @analyst from brief.md. -->

All code is in `android/app/src/main/java/app/solyto/` (`widget/` package plus
`WidgetBridgePlugin.java`). Nothing in `frontend/`, no manifest, backup-rule,
layout, string or dependency changes are expected. There are no Android unit
tests in the repo (only the Capacitor example tests), so each task is checked
by compiling (`cd android && ./gradlew assembleDebug`, if the SDK is available)
and, finally, by the manual checks in TASK-9.

Each task should leave the module compiling: when a task changes a signature,
it also updates its callers mechanically (for now still with `your-day` only).

## Task breakdown

TASK-1: Add a widget kind registry (e.g. `WidgetKind`) listing each kind with its payload `kind` string, its API path (`/api/v1/widgets/<kind>`), its provider class, a way to re-render that provider (e.g. a `Consumer<Context>` method reference to the provider's own static render-all), and its known section keys; only `your-day` (`today`, `due`, `upcoming`) for now.
  files: widget/WidgetKind.java (new)
  depends: none
  risk: low — new, self-contained file; the only design choice is how a kind triggers its provider's render (keep it a plain method reference, no new base class).

TASK-2: Rename `YourDayPayload` to `WidgetPayload` and make `parse` take the expected kind, checking the payload's `kind` against it and taking the allowed section keys from that kind's registry entry; keep icons, action types, id/key validation, row caps and `refresh_at` handling unchanged (`refreshAt` stays -1 when absent).
  files: widget/YourDayPayload.java → widget/WidgetPayload.java, widget/YourDayWidgetProvider.java, widget/WidgetFetchWorker.java, widget/WidgetActionReceiver.java, widget/WidgetActionWorker.java, widget/WidgetApi.java (references only)
  depends: TASK-1
  risk: low — a rename plus one parameter; behaviour for `your-day` payloads must be byte-for-byte the same.

TASK-3: Make `WidgetApi` fetch a given kind from its registry path instead of the hardcoded `YOUR_DAY_PATH` (`fetchYourDay` → `fetch(context, apiUrl, token, kind)`); `postAction` stays as is.
  files: widget/WidgetApi.java, widget/WidgetFetchWorker.java (call site)
  depends: TASK-1
  risk: low — only the URL source changes; status/outcome mapping is untouched.

TASK-4: Store payload, fetch time, outdated flag, action rows and action error per kind in `WidgetCache` using kind-prefixed keys in the existing `widget_cache` prefs file, keep `state` and `device_unsupported` global, make `clear` wipe every kind's keys, and on first use after the update remove the old unprefixed keys (`payload`, `fetched_at`, `outdated`, `action_rows`, `action_error`) once, guarded by a marker key, with no migration.
  files: widget/WidgetCache.java, widget/YourDayWidgetProvider.java, widget/WidgetFetchWorker.java, widget/WidgetActionReceiver.java, widget/WidgetActionWorker.java (call sites pass the kind)
  depends: TASK-1
  risk: medium — upgrade path: after the old keys are dropped the global state can still be `OK` while Your Day has no payload, and today's render shows "update the app" for that case (`payload == null` under `OK`); render must show the loading text instead until the re-fetch lands (see TASK-8), or the upgrade causes a visible glitch.

TASK-5: Add one central `updateAll(context)` (e.g. on `WidgetKind`/a small static helper next to it) that re-renders every registered kind's provider, plus an "any widget of any kind placed" check, and switch `WidgetBridgePlugin` (`load`, `clear`, `unsupported`, `setToken`) and both workers to them.
  files: widget/WidgetKind.java, widget/YourDayWidgetProvider.java (keeps its own per-provider render and `hasWidgets`), WidgetBridgePlugin.java, widget/WidgetFetchWorker.java, widget/WidgetActionWorker.java, widget/WidgetActionReceiver.java
  depends: TASK-1
  risk: low — call-site swap; `YourDayWidgetProvider.updateAll` remains the per-kind render the registry points to.

TASK-6: Make the fetch worker loop over every kind with at least one placed widget, fetching each from its own path: 401 clears token+cache and stops the loop, 404 sets `UNSUPPORTED_SERVER` and 426 (or a newer `schema_version`) sets `UPDATE_APP` globally as today, 429/5xx/offline/unparseable marks only that kind outdated, a success saves that kind; retry when any kind failed temporarily; schedule the `refresh_at` fetch only for kinds that send one, using a per-kind unique work name (e.g. `widget-fetch-at-refresh-<kind>`).
  files: widget/WidgetFetchWorker.java, widget/WidgetWork.java (`fetchAt` takes the kind; `cancelAll` cancels every kind's refresh work)
  depends: TASK-2, TASK-3, TASK-4, TASK-5
  risk: medium — the order of global vs per-kind outcomes in one run (e.g. one kind OK, the next 401) and the "token changed during the request" check must still hold per request; with one kind it must behave exactly like today.

TASK-7: Tie scheduling to "any kind placed": `WidgetWork.fetchNow` runs when any registered kind has widgets, the fetch worker's early exit uses the same check, and `YourDayWidgetProvider.onDisabled` only cancels all work when no widget of any kind is left (`onEnabled`/`onUpdate` keep scheduling the periodic work).
  files: widget/WidgetWork.java, widget/YourDayWidgetProvider.java, widget/WidgetFetchWorker.java
  depends: TASK-5
  risk: medium — getting the "last widget removed" check wrong either leaves background work running with no widget (D9) or cancels it while another kind is still placed.

TASK-8: Pass the kind through the action path: the provider adds an `EXTRA_ACTION_KIND` to the checkbox fill-in intent; the receiver validates it against the registry, looks the row up in that kind's cached payload and starts the action in that kind's action state; `WidgetWork.runAction` puts the kind into the input data and the unique work name (e.g. `widget-action-<kind>-<id>`); the worker finishes/reverts in that kind's state and, after success or 404, re-fetches all placed kinds via `fetchNow`. Also update the provider's render to read its own kind's cache and show the loading text when the global state is `OK` but its kind has no payload yet.
  files: widget/YourDayWidgetProvider.java, widget/WidgetActionReceiver.java, widget/WidgetActionWorker.java, widget/WidgetWork.java
  depends: TASK-2, TASK-4, TASK-5
  risk: medium — the fill-in extras are untrusted (D3): an unknown or missing kind must be rejected and re-render to undo the launcher's local CheckBox toggle, exactly like an invalid key today; an action enqueued by the old build (no kind in its input data) must be treated as `your-day` or dropped safely — the developer should pick one and note it.

TASK-9: Run the manual checks from the brief on a device/emulator and record the results in implementation.md: Your Day shows data, row tap opens the todo, tap-to-complete, offline (outdated label), logout (signed-out text), unsupported server, and an in-place update from the previous build with a Your Day widget placed (it refreshes and keeps working, no "update the app" flash).
  files: docs/jobs/eat_widget-foundation-support-several-widget-kinds/implementation.md
  depends: TASK-1 … TASK-8
  risk: medium — needs a device and a reachable widget-capable API; if the developer cannot run them, they must say so in implementation.md rather than mark them done.

## Notes for the developer

- `WidgetTokenStore`, the manifest, `backup_rules.xml`, `data_extraction_rules.xml`, layouts and strings should not change; if one of them seems to need a change, flag it.
- The brief leaves open whether a newer `schema_version` from one kind should be global; this plan keeps today's behaviour (global `UPDATE_APP`), since the time tracking job keeps `schema_version` at 1.
- No new base provider class: shared provider behaviour (schedule on enable, cancel on last disable) goes through static helpers in `WidgetWork`, matching the existing style.
