# Verdict: widget foundation: support several widget kinds

id: eat
reviewer: @reviewer
date: 2026-10-29

## Review

Reviewed `git diff main...HEAD` (all changes in `android/app/src/main/java/app/solyto/`
plus job docs). No JDK/Android SDK in this session either, so the review is a
static one: imports, types, visibility and the circular static init between
`WidgetKind` and `YourDayWidgetProvider` all look sound.

TASK-1: PASS
notes: `WidgetKind` enum has id, path, provider class, `Consumer<Context>` render
(`YourDayWidgetProvider::updateAll`) and section keys. No base class.

TASK-2: PASS
notes: `WidgetPayload` is a byte-for-byte rename of `YourDayPayload`. The only
changes are `parse(data, kind)`, which checks `kind.id`, and section keys taken
from the kind. Icons, action types, id/key validation, row caps and `refresh_at` are unchanged.

TASK-3: PASS
notes: `WidgetApi.fetch(..., kind)` uses `kind.path`. `postAction` is unchanged.

TASK-4: PASS
notes: Per-kind keys are `<kind>.<name>` in the same `widget_cache` prefs. `state` and
`device_unsupported` stay global. `clear` wipes every kind. The old unprefixed keys are
dropped once, guarded by `per_kind`. Re-fetch after the update comes from the
`APPWIDGET_UPDATE` the system sends on a package replace (`onUpdate` → `fetchNow`).

TASK-5: PASS
notes: `WidgetKind.updateAll`/`anyPlaced` are used by the plugin, the workers and the receiver.
`YourDayWidgetProvider.hasWidgets` was removed, not kept as tasks.md said. It had no
callers left, `WidgetKind.hasWidgets` replaces it, and implementation.md records it. Acceptable.

TASK-6: PASS
notes: The loop only covers placed kinds. The token-changed check runs after every request.
401 / 404 / 426 / newer schema end the run with the global state. Temporary failures and
unparseable payloads mark only their own kind and lead to a retry. With one kind, the
behaviour matches the old worker. Refresh work is per kind, and the old unsuffixed name is
also cancelled.

TASK-7: PASS
notes: `fetchNow` and the worker's early exit use `anyPlaced`. `onDisabled` →
`cancelIfNoWidgets`.

TASK-8: PASS
notes: The kind extra is on the fill-in. The receiver rejects a missing or unknown kind and
re-renders. Cache and action state are per kind. The work name and input data carry the kind.
The worker maps a missing kind (queued by the old build) to `your-day`, which is documented.
`fetchNow` re-fetches all placed kinds. The render shows Loading / load-failed for OK with no
payload of its kind.

TASK-9: PARTIAL
notes: The developer has not compiled the code or run the manual checks, and says so in
implementation.md. No agent session here has a JDK, an SDK or a device. Before release,
a human must run `./gradlew assembleDebug` and the brief's step-8 checks, including an
in-place update with a Your Day widget placed.

## Security

Not run. The untrusted fill-in kind extra is validated against the registry. The token
never goes into WorkManager data.

## Overall

APPROVED

No code changes are required. The only open item is the human compile and device check
under TASK-9.
