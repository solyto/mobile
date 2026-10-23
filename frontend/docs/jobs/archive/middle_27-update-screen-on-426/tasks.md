# Tasks: 27 Update screen on 426

id: middle
analyst: @analyst
date: 2026-10-15

<!-- Produced by @analyst from brief.md. -->

## Context (what the code looks like today)

- Branch verified: worktree HEAD is `feature/middle_27-update-screen-on-426`.
- Backlog 26 is already in: `ApiService` sends `X-Client-Version` from
  `CLIENT_VERSION` (`src/lib/config/platform.ts:18`, `env.PUBLIC_VERSION`).
- There is exactly one `ApiService` instance, created in `Auth`'s constructor
  (`src/lib/state/Auth.svelte.ts:49-50`), which also registers the 401
  `unauthorizedHandler`. Every request goes through
  `ApiService.fetchWithRecovery` (`src/lib/services/ApiService.ts:42-57`), so
  that is the single place where 426 is detected.
- Today a 426 falls through `fetchWithRecovery` unchanged (it is not 401), so
  it already never triggers recovery/logout. The job is to *detect* it and
  surface it. The new tests must lock in "426 never calls the unauthorized
  handler".
- Pattern to follow for "store exposes an event, layout reacts":
  `ApiService.setUnauthorizedHandler` and `Auth.setSessionExpiredHandler`
  wired in `src/routes/+layout.svelte:76` (STANDARDS 5.6; no `$effect`
  watchers).
- Desktop shell already has an auto-updater bridge:
  `window.electronAPI.checkForUpdates/installUpdate/onUpdaterStatus`
  (`src/lib/types/platform.ts`) with a UI in
  `src/lib/components/settings/UpdateChecker.svelte` (used in
  `AppSettings.svelte:60`). Note: its strings are hard-coded English (a
  pre-existing violation of STANDARDS 8.1).
- No store / F-Droid / release URLs exist anywhere in `src/`.
- Raw `fetch` calls outside `ApiService` (`routes/setup/+page.svelte` health
  check, `ManageWeatherCity.svelte` – backlog 22) are not covered by this job:
  health is never rejected by the API, and the weather search is backlog 22.

## Task breakdown

TASK-1: Detect 426 in `ApiService.fetchWithRecovery` and report it through a new `setUpgradeRequiredHandler(handler)` setter (mirroring `setUnauthorizedHandler`), checked before the 401 branch, without retrying and without calling the unauthorized handler; callers keep their current `null`/`false` results.
     files: src/lib/services/ApiService.ts
     depends: none
     risk: medium — this is the single choke point for every request; reading `meta.min_client_version` must use `res.clone()` inside a try/catch so a malformed body or the callers' own `res.json()` (e.g. `postRaw`) never break.

TASK-2: Add unit tests for the 426 handling: handler called once with the min version from `meta.min_client_version` (and `null` for a missing/non-JSON body), unauthorized handler never called, fetch called exactly once, `list`/`get` resolve `null`, `update`/`delete` resolve `false`, no handler set is a no-op; existing 401 tests stay green.
     files: tests/unit/services/ApiService.test.ts
     depends: TASK-1
     risk: low — pure service tests following the existing `jsonResponse` / `vi.stubGlobal('fetch')` recipe; the mock needs a `clone()` method if TASK-1 uses it.

TASK-3: Add a small context store holding the "update required" state (`required: boolean`, `minVersion: string | null`, one setter method) with the usual `set…/get…` context pair.
     files: src/lib/state/UpdateRequired.svelte.ts (new)
     depends: none
     risk: low — a plain `$state` class like the other 37 context stores; kept out of `Auth` per STANDARDS 11.5 (Auth handles sessions, not client versions). See open question 4 if the owner prefers it on `Auth`.

TASK-4: Add the i18n strings for the update screen as a new `update_required` section (title, explanation, per-platform instruction for web / desktop / mobile, reload button label, "required version / your version" line) in the type and all four language files.
     files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
     depends: none
     risk: low — additive; `npm run check` enforces that all four files match the type. Mobile wording depends on open question 1.

TASK-5: Build the update screen component: a full-page message using the TASK-4 strings and existing `ui/`/`forms/` buttons, choosing the instruction via `IS_WEB` / `IS_DESKTOP` / `IS_MOBILE`; web gets a reload button, desktop a text instruction by default (open question 2), mobile a text instruction (open question 1); `minVersion` and the current `CLIENT_VERSION` passed in as props.
     files: src/lib/components/ui/UpdateRequiredScreen.svelte (new); possibly src/lib/components/settings/UpdateChecker.svelte (reuse only, see open question 2)
     depends: TASK-4
     risk: medium — the web reload must actually load the new build despite the service worker (open question 3); no `$effect`, no private key listeners, named handlers (STANDARDS 4.1, 5).

TASK-6: Wire it up in the root layout: create the TASK-3 store, register `auth.apiService.setUpgradeRequiredHandler(...)` next to `auth.setSessionExpiredHandler(...)`, and when `required` is set render the update screen in place of `children`, navbars, QuickAdd and WelcomeTour (keep the desktop `TitleBar` so the window can still be closed).
     files: src/routes/+layout.svelte
     depends: TASK-1, TASK-3, TASK-5
     risk: medium — the layout gates every route; the handler must be registered before the first response comes back (Auth's constructor starts `load()` immediately, but responses resolve after the layout script finishes synchronously, so registering right after `setAuth()` is enough — the developer should confirm). Must not touch the logged-in/redirect logic.

TASK-7: Verify: `npm run check`, `npm run lint`, `npm test`, then a manual run against a local API with `MIN_CLIENT_VERSION` above the build's `PUBLIC_VERSION` (screen appears, no logout, no session-expired toast, `auth.*`/health still work), and once with the check off (app unchanged).
     files: none (record results in implementation.md)
     depends: TASK-1 … TASK-6
     risk: low — verification only; the manual run needs a local API at `solyto/api` `c5f3b99` or later.

## Open questions (unclear scope — not guessed)

1. **Mobile instruction / links.** The brief says "mobile store/F-Droid", but
   no store or F-Droid URL exists in the repo, and it is not stated whether
   there is an iOS build. Default if unanswered: a text-only instruction
   ("update solyto from the app store or F-Droid you installed it from"),
   no links. If links are wanted, the owner has to provide the URLs (and they
   would go into `src/lib/config/urls.ts`).
2. **Desktop: reuse `UpdateChecker`?** The Electron auto-updater bridge
   exists and `UpdateChecker.svelte` drives it, but its strings are hard-coded
   English, which would put untranslated text on a screen the brief requires
   to be fully translated. Options: (a) text-only instruction, (b) reuse
   `UpdateChecker` as-is and log its strings as a backlog item, (c) also
   translate `UpdateChecker` in this job (scope expansion). Default if
   unanswered: (a), a translated text-only instruction ("restart solyto or
   use Settings → check for updates"). (b) and (c) need the owner's go-ahead.
3. **Web reload vs. the service worker.** `src/service-worker.ts` serves
   cached pages stale-while-revalidate, so a single `location.reload()` may
   load the old HTML again. A `navigator.serviceWorker.getRegistration()` →
   `update()` before reloading probably fixes it, but this must be confirmed
   in the TASK-7 manual run (production build via `npm run build` +
   `npm run preview`, since the SW is not active in `npm run dev`). If it
   needs SW changes, that is a separate decision.
4. **Where the flag lives.** Planned as a separate small store (TASK-3). If
   the owner prefers it as a `$state` field on `Auth` (which owns the
   `ApiService`), TASK-3 merges into `Auth.svelte.ts` and TASK-6 reads it from
   there; no other task changes.
