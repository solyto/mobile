# Backlog: Android widget foundation and read-only "Your Day" widget

created: 2026-10-29

## What

Build the native foundation for home-screen widgets and the first widget on
it: a read-only "Your Day" list (today's events, due and overdue todos,
upcoming events). Tapping a row opens the matching page in the app. Tap-to-
complete comes in [[android-widget-tap-to-complete]], on this foundation.

This is job 5 of 6 in `docs/reports/android-homescreen-widgets-decisions.md`
(D3, D6, D7, D9, D11, D12). Read that document first. It depends on the API
jobs (`widget-token`, `widget-your-day-and-complete-action` in
`solyto/api`) and the app job (`android-widget-bridge` in `solyto/app`).

## Why

Users want their day at a glance without opening the app. Every later widget
reuses what this job builds: the bridge, the token store, fetching, the list
renderer, routing and the error states.

## Steps

1. **Vendor** the app with `scripts/vendor.sh`, so `frontend/` contains the
   widget bridge module (and the Italian translation added since the last
   vendor run). Commit it separately.
2. **Bridge:** a Capacitor plugin (registered in `MainActivity` like
   `PullToRefreshPlugin`, so it is set up before the first page loads) that
   calls `WebViewCompat.addWebMessageListener` with the name `SolytoWidgets`
   and the allowed origin from `getBridge().getLocalUrl()`
   (`https://my.solyto.app`).
   - Accept main-frame messages only; ignore anything malformed.
   - Implement the contract from the app job exactly: `ready` → reply
     `{type:"status", needsToken}` and deliver a pending route; `setToken`;
     `clear`; `refresh`. Native → app: `{type:"navigate", key, id?}` through
     the reply proxy kept from `ready`.
   - If `WEB_MESSAGE_LISTENER` is not supported, register nothing; widgets
     show a "not supported on this device" state.
   - Never return the token to JS.
3. **Token store:** an AES-GCM key in the AndroidKeyStore encrypts the
   token; the ciphertext, IV, expiry and API URL go into private
   `SharedPreferences`. `needsToken` is true when there is no token or it has
   expired. `clear` deletes the token and the cached widget data. Do not use
   `androidx.security:security-crypto` (deprecated).
4. **Backup exclusion:** exclude the token prefs and the widget data cache
   (`android:fullBackupContent` for API ≤ 30, `android:dataExtractionRules`
   for API 31+). Manifest change: flag it in review.
5. **Fetching:** `HttpURLConnection` + `org.json`, `Authorization: Bearer`
   with the widget token, `X-Client-Version` with the app version. The token
   and full responses are never logged.
6. **Workers** (`androidx.work:work-runtime`):
   - a periodic fetch every 60 minutes, scheduled in the provider's
     `onEnabled`, cancelled in `onDisabled`;
   - a one-off fetch at the payload's `refresh_at`;
   - a one-off fetch on `refresh`, `setToken` and when a widget is added;
   - the token is **never** put into WorkManager input data; workers read it
     from the token store;
   - `updatePeriodMillis="0"` in the provider XML.
7. **Your Day widget** (`AppWidgetProvider` + `RemoteViews`, list via
   `androidx.core:core-remoteviews` `RemoteCollectionItems`):
   - renders the generic format: section headers, rows with `title`,
     `subtitle`, `time_label`, icon from a fixed set (`event`, `todo`);
     unknown section, row or icon types are skipped, not errors; a higher
     `schema_version` than supported shows the "update the app" state;
   - `labels.empty` when there are no sections;
   - a header with the title and "updated at"; tapping it opens the app;
   - light and dark (`values-night`), using the existing colour resources;
   - `appwidget-provider` XML with a preview image and description, sensible
     default and minimum sizes, resizable.
8. **Routing (D6):** rows use the mutable template `PendingIntent` (explicit
   `MainActivity` component) plus per-row fill-in intents carrying
   `route.key` and `route.id`. `MainActivity` handles them in `onCreate` and
   `onNewIntent`: validate the key format (`[a-z][a-z0-9_.-]*`) and the id
   length, then send `navigate` if the app is ready, or keep it until
   `ready` arrives. Native keeps no list of paths; the app maps keys.
   Other widget `PendingIntent`s are explicit and `FLAG_IMMUTABLE`, with
   distinct request codes.
9. **States (D11):** loading; signed out ("Open solyto to sign in", on 401:
   delete the local token too); server without widgets (404 on the widget
   route, D12); "Please update the app" (426 or unknown `schema_version`);
   offline/429/5xx: keep the last data, mark it as outdated, back off; not
   supported on this device.
10. **Strings** in `values` and `values-de/fr/es/it`: picker name and
    description and all states. Content text comes from the server.
11. **Dependencies:** only `androidx.core:core-remoteviews` and
    `androidx.work:work-runtime` are new (Apache-2.0, Google Maven, no GMS).
    Add versions to `variables.gradle` like the others. Confirm the F-Droid
    build (`fdroid/`) needs no change.
12. **Manual checks** (report §7.6): place, resize and remove the widget;
    light/dark; API 24 and API 34+ emulators; login → data appears; logout →
    signed-out state; app token refresh → widget keeps working; tap a todo
    row and an event row, both warm and cold start; airplane mode; server
    URL of an old self-hosted server; reboot.

## Out of scope

- Tap-to-complete ([[android-widget-tap-to-complete]]).
- Other widgets, static app shortcuts, a widget setup screen.
- Moving the share intent to the bridge.

## Notes

- `MainActivity` is exported; a forged intent can at most open a known page.
- Native uses exactly the API URL from `setToken`, under the same network
  security rules as the WebView.
