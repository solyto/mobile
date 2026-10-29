# Implementation: widget foundation: support several widget kinds

id: eat
developer: @developer
date: 2026-10-29

## Summary

The native widget foundation now serves any number of widget kinds. A new
widget needs an entry in `WidgetKind`, a provider with its layout, and the
server's `/api/v1/widgets/<kind>` endpoint. Your Day is the only kind for now.
Its rendering and behaviour should be unchanged. **This has not been compiled
or run:** this session had no JDK or Android SDK (see TASK-9).

## Changes

All files are in `android/app/src/main/java/app/solyto/`.

TASK-1: New `widget/WidgetKind.java`, a public enum. Each kind has its `id`
(the payload `kind` and the path segment), `path`, provider class, a
`Consumer<Context>` render reference (the provider's static `updateAll`) and
its section keys. Only `YOUR_DAY` (`today`, `due`, `upcoming`) exists.

TASK-2: Renamed `YourDayPayload` to `widget/WidgetPayload.java`.
`parse(data, kind)` checks `kind` against the entry and takes the section keys
from it. Everything else in the parser is unchanged. References were updated.

TASK-3: `WidgetApi.fetchYourDay` became `fetch(context, apiUrl, token, kind)`
and uses `kind.path`. `postAction` is unchanged.

TASK-4: `WidgetCache` now keeps payload, fetched-at, outdated, action rows and
action error per kind, under `<kind>.<name>` keys in the same `widget_cache`
prefs. `state` and `device_unsupported` stay global. `clear` removes every
kind's keys. The first prefs access removes the old unprefixed keys once,
guarded by a `per_kind` marker. Nothing is migrated.

TASK-5: Added `WidgetKind.updateAll` (renders every kind) and
`WidgetKind.anyPlaced`. `WidgetBridgePlugin` and the workers and receiver now
use them. I removed `YourDayWidgetProvider.hasWidgets` because nothing uses it
any more; `WidgetKind.hasWidgets` replaces it.

TASK-6: `WidgetFetchWorker` loops over the kinds that have placed widgets:
- **401:** clears the token and cache, then ends the run.
- **404, 426, or a newer `schema_version`:** sets the global state, then ends
  the run. Any kinds already saved in that run stay saved, but the global
  state wins.
- **429, 5xx, offline, or an unparseable payload:** marks only that kind
  outdated. The worker retries if any kind failed.

The token-changed check runs after every request. `refresh_at` is scheduled
per kind under `widget-fetch-at-refresh-<kind>`. `cancelAll` also cancels the
old unsuffixed name.

TASK-7: `fetchNow` and the fetch worker's early exit now check `anyPlaced`.
`YourDayWidgetProvider.onDisabled` calls the new
`WidgetWork.cancelIfNoWidgets`, so work stops only when no kind is placed.
`cancelAll` is now private.

TASK-8:
- The checkbox fill-in carries `EXTRA_ACTION_KIND`. The receiver rejects a
  missing or unknown kind and re-renders, like an invalid key.
- The receiver looks the row up in that kind's cache and keeps action state
  per kind.
- `WidgetWork.runAction` puts the kind into the input data and into the unique
  work name (`widget-action-<kind>-<id>`).
- `WidgetActionWorker` treats a missing kind (an action queued by the old
  build) as `your-day`, so the user's tap still runs. An unknown kind is
  dropped. After success or 404, `fetchNow` re-fetches all placed kinds.
- The provider reads its own kind's cache. If the state is `OK` but its kind
  has no payload, it now shows "Loading…" (or "load failed" if that kind's
  fetch failed) instead of "update the app". This avoids a wrong message right
  after the update.

TASK-9: **Not done.** This session had no device, emulator, JDK or Android
SDK, so I couldn't compile (`./gradlew assembleDebug`) or run any of the
manual checks. Someone with a device still needs to do all of them:
- Your Day shows data
- tapping a row opens the todo
- tap-to-complete works
- offline shows the outdated label
- logout shows the signed-out text
- an unsupported server shows its message
- an in-place update from the previous build, with a Your Day widget placed,
  refreshes with no "update the app" flash

## Known issues / follow-ups

- The code has not been compiled. Run `./gradlew assembleDebug` first.
- One small change for an edge case: if the state is `OK` but the stored Your
  Day payload doesn't parse, the widget now shows "Loading…" instead of
  "update the app". The fetch worker only saves payloads that parse, so this
  should not happen in practice.
- After the update, the widget refreshes only when the launcher sends
  `APPWIDGET_UPDATE` (usual on a package update), when a periodic fetch runs,
  or when the app sends `setToken`. Until then it shows "Loading…". The manual
  update check should confirm this.
- A 404 on any kind's route sets the global "server without widgets" state,
  as the brief asks. This could be wrong for a server that has Your Day but
  not a newer kind. That is a decision for the time tracking job.
