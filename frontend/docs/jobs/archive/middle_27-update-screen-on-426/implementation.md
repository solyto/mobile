# Implementation: 27 Update screen on 426

id: middle
developer: @developer
date: 2026-10-15

## Summary

`ApiService` now detects a 426 response and reports it, along with `meta.min_client_version`, through a new `setUpgradeRequiredHandler`. A 426 never runs the 401 recovery, never retries and never logs out. Callers still get their usual `null`/`false` result. The root layout registers the handler next to the session-expired handler. It stores the state in a new `UpdateRequired` context store and, once a 426 arrives, shows a full-page `UpdateRequiredScreen` in place of the app (routes, navbars, WelcomeTour, QuickAdd). The desktop `TitleBar` stays visible. The screen shows a translated instruction for each platform (web, desktop, mobile). On web it adds a button that updates the service worker and then reloads.

The analyst's open questions had no owner answer, so I used each documented default:
1. Mobile: text-only instruction ("app store or F-Droid"), no links.
2. Desktop: translated text-only instruction ("quit and restart solyto"); `UpdateChecker` is not reused.
3. Web: `navigator.serviceWorker.getRegistration()` → `update()` → `location.reload()` (not verified, see below).
4. The flag lives in its own store, not on `Auth`.

## Changes

TASK-1: `src/lib/services/ApiService.ts`
- Added `setUpgradeRequiredHandler(handler: (minVersion: string | null) => void)`.
- `fetchWithRecovery` checks for 426 before the 401 branch. It reports the 426 and returns the response unchanged, with no retry and no unauthorized handler.
- `readMinClientVersion` reads the body from `res.clone()` inside a try/catch. That way `postRaw` can still parse the body, and a missing or non-JSON body gives `null`. Without a handler the body is not touched.

TASK-2: `tests/unit/services/ApiService.test.ts`
- New `426 upgrade required` block. It covers:
  - the handler is called with the min version, or with `null` when the field is missing or the body is not JSON;
  - the unauthorized handler is never called;
  - fetch is called exactly once;
  - `list`/`get` resolve `null` and `update`/`delete` resolve `false`;
  - `postRaw` can still read the body;
  - with no handler set, nothing happens (no `clone()`).

TASK-3: `src/lib/state/UpdateRequired.svelte.ts` (new)
- A context store with `required`, `minVersion`, `require(minVersion)` and the `setUpdateRequired`/`getUpdateRequired` pair.

TASK-4: `src/lib/types/translation.ts`, `src/lib/i18n/{en,de,es,fr}.ts`
- New `update_required` section in all four files: `title`, `explanation`, `instruction_web`/`instruction_desktop`/`instruction_mobile`, `reload`, `required_version`, `your_version`.
- The wording uses the informal register that dominates each file (de "du", es "tú", fr "tu").

TASK-5: `src/lib/components/ui/UpdateRequiredScreen.svelte` (new)
- A centred card in the setup page's visual style, with the logo, title, explanation and platform instruction.
- It shows the required version and your version only when each is known.
- On web only, a `TextButton` updates the service worker and then reloads.
- The logo comes from the bundled `$lib/assets/logo_cut.png` import. `StaggeredLogo` needs a route-relative path, and this screen can appear on any route.

TASK-6: `src/routes/+layout.svelte`
- Creates the store and registers `handleUpgradeRequired` on `auth.apiService` right after `setSessionExpiredHandler`. This happens synchronously in the layout script, before any response from `Auth.load()` can resolve.
- When `updateRequired.required` is set:
  - the content container renders the update screen instead of children, navbars and WelcomeTour;
  - the QuickAdd block is hidden;
  - TitleBar, LoadingIndicator, Notifications and CookieBanner stay as they were.
- Login, redirect and session logic are untouched.
- I checked `Auth`: `performRefresh` maps only 401/403 to `rejected`. A 426 (which the API never sends for `auth/*` anyway) counts as `transient`, so neither the session monitor nor recovery can log out on it.

TASK-7: verification. **Not run:**
- This worktree has no `node_modules`. Installing dependencies needs the owner's approval, as in earlier jobs. So `npm run check`, `npm run lint` and `npm test` were **not run**.
- No local API is reachable at `localhost:8000`, so the manual run against `MIN_CLIENT_VERSION` was not done either.
- What I did instead: checked the diffs by hand against the ESLint rules (`semi`, `comma-dangle`), checked the i18n key sets for parity, and traced each new test against the mocks.

## Known issues / follow-ups

- **Still to do (owner or reviewer):**
  - Run `npm ci && npm run check && npm run lint && npm test`.
  - Do the manual run from the brief: a local API with `MIN_CLIENT_VERSION` above the build's `PUBLIC_VERSION`. The screen should appear, with no logout and no session-expired toast. Then run once with the check off; the app should be unchanged.
- **Web reload and the service worker (open question 3):** this is not verified. It needs a production build (`npm run build && npm run preview`), because the SW is not active in dev. `registration.update()` may resolve before the new worker has activated. If one click still loads the old HTML, the next step is to wait for the new worker to activate before reloading. That stays a client-side change with no SW edits.
- Open questions 1 and 2 used their defaults: no store/F-Droid links, and no reuse of the hard-coded-English `UpdateChecker`. If links are wanted, the URLs belong in `src/lib/config/urls.ts`.
- Pre-existing: `UpdateChecker.svelte` has hard-coded English strings (STANDARDS 8.1), which is not in this job's scope.
