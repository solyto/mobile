# Tasks: 26 Send the X-Client-Version header

Branch verified: worktree HEAD is `refs/heads/feature/chest_26-send-the-x-client-version-header`, which matches `brief.md`.

## What I found

- `src/lib/services/ApiService.ts` builds headers in four places:
  - `getAuthHeaderOnly()` (`:202`), used by `postFormData` and `uploadFile`
  - `getApiHeader()` (`:206`), with and without a token
  - `getApiHeaderWithBody()` (`:214`), with and without a token
  - an inline `{ Authorization, Accept: accept }` object in `download()` (`:195-198`). This is the "`Accept` variant" the brief mentions.
  All of them are called through `fetchWithRecovery`, so the 401 retry path rebuilds them too.
- `src/routes/setup/+page.svelte:34` runs `fetch(\`${baseUrl}/api/v1/health\`)` with no headers.
- The only version source in the app is `env.PUBLIC_VERSION` (`$env/dynamic/public`), read in `src/lib/components/settings/AppSettings.svelte:18`. Nothing in this repo sets it (no `.env.example` entry, nothing in the Makefile or config). It must come from the external deployment repo, so its runtime format (`1.2.3`, `v1.2.3`, a git hash, ...) can't be checked from here. `package.json` has `0.0.1`, which is a placeholder.
- The other direct `fetch(` calls are not in scope: `service-worker.ts` passes through the page's own requests, and `ManageWeatherCity.svelte` calls nominatim.openstreetmap.org, not the solyto API. Adding the header there would cause an unwanted CORS preflight to a third party.
- `tests/unit/services/ApiService.test.ts` checks header objects with exact `toEqual` / `toHaveBeenCalledWith` (for example `:26-40`, `:98-101`, `:219`, `:242`, `:264`, `:367-421`). Unit tests run with an empty public env.

## Assumptions (developer: confirm or stop)

1. **Version source = `env.PUBLIC_VERSION`.** The brief leaves this open. `PUBLIC_VERSION` is the value the app already shows to the user as its version, and the API ignores missing or non-`x.y.z` values, so a wrong format does no harm. If the owner wants a different source (for example `package.json` via Vite `define`), TASK-1 changes. Don't invent a new source.
2. **No header when `PUBLIC_VERSION` is unset or empty.** Don't send an empty value. This keeps behaviour unchanged for dev and test environments, so the existing exact-match header tests still pass without an env set.
3. **The value is sent as-is.** Don't normalize it (for example by stripping a leading `v`) in the client. The API handles validation. If the owner wants normalization, that's a separate decision.

## Deployment gate (not a code task, the owner must handle it)

The API's CORS change (allowing `X-Client-Version` in `Access-Control-Allow-Headers`) must be live in prod **and** on any self-hosted API this build talks to before this frontend ships. Otherwise every preflighted request fails. Self-hosted instances on an older API are a real risk for the setup health check and for all `ApiService` calls. The owner should decide whether that's acceptable. It's flagged here, not solved.

---

## TASK-1 — Expose the client version from one place

Add one exported read of `env.PUBLIC_VERSION` (for example a `CLIENT_VERSION` constant next to the other env-derived values in `src/lib/config/platform.ts`) so that `ApiService` and the setup page use the same source.

- Files: `src/lib/config/platform.ts`, and optionally `src/lib/components/settings/AppSettings.svelte` if the owner wants it to reuse the constant. Not required, so leave it alone unless asked.
- Dependencies: none
- Risk: **low**. It only adds a read-only export. The open question (Assumption 1) is the only uncertainty.
- Unclear: whether a new export in `platform.ts` counts as a "new abstraction". If the developer thinks so, reading `env.PUBLIC_VERSION` directly in both call sites is the fallback.

## TASK-2 — Add `X-Client-Version` to every `ApiService` header builder

Add the header to `getAuthHeaderOnly`, both branches of `getApiHeader` and `getApiHeaderWithBody`, and the inline headers in `download()`. Only add it when the version is non-empty (Assumption 2).

- Files: `src/lib/services/ApiService.ts`
- Dependencies: TASK-1
- Risk: **medium**. Every API request goes through here. The header triggers a CORS preflight on all requests, so it only works once the API's CORS change is deployed (see the deployment gate).

## TASK-3 — Unit tests for the header in `ApiService`

Add tests to `tests/unit/services/ApiService.test.ts` that mock `$env/dynamic/public` with a `PUBLIC_VERSION`. Follow the existing `vi.doMock` + dynamic import pattern in `tests/unit/config/platform.test.ts`. Assert that `X-Client-Version` is present on all four builder paths (with and without a token, and on the 401-retry rebuild), and absent when the env is empty. Existing exact-match tests should pass unchanged.

- Files: `tests/unit/services/ApiService.test.ts`, or a new sibling file such as `tests/unit/services/ApiServiceClientVersion.test.ts` if mocking the env in the existing file would affect its other tests (the pattern `NavigationEnv.test.ts` uses)
- Dependencies: TASK-2
- Risk: **low**. Test-only. The main pitfall is env mock or module cache leaking between tests.

## TASK-4 — Send the header on the setup health check

Pass `headers: { 'X-Client-Version': ... }` on the `fetch` in `src/routes/setup/+page.svelte:34`, only when the version is non-empty. Keep everything else the same.

- Files: `src/routes/setup/+page.svelte`
- Dependencies: TASK-1
- Risk: **medium**. A plain GET with no custom headers is currently a CORS "simple request". Adding the header makes it preflighted, so a self-hosted API without the CORS change will now fail setup with `urlError` ("not a solyto API"). Per `docs/TESTING.md` this is component code, so no unit test is planned.

## TASK-5 — Verify

Run `npm run check`, `npm run lint`, and `npm test`. Then, against an API that has the CORS change and with `PUBLIC_VERSION` set, check in the browser dev tools that `X-Client-Version` appears on a normal authenticated request, an unauthenticated one (login), a file download, and the setup health check. The brief asks for the browser check. This is the one place where it's justified.

- Files: none
- Dependencies: TASK-2, TASK-3, TASK-4
- Risk: **low**. Verification only. It needs a local API at `dd762ca` or later, which may not be available in the sandbox. If not, report that the browser check is pending rather than skipping it silently.

## Out of scope

- Handling HTTP 426 / minimum version (backlog 27)
- Adding the header to `service-worker.ts` or `ManageWeatherCity.svelte`
- Changing where `PUBLIC_VERSION` is set (deployment repo)
- Bumping `package.json` version
