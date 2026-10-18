# Verdict: 26 Send the X-Client-Version header

id: chest
reviewer: claude (reviewer agent)
date: 2026-10-14

## Review (re-review after `e5b5c35`)

Branch verified: `feature/chest_26-send-the-x-client-version-header`. Base: `main` (from `.manigot/manigot.json`). Reviewed `git diff main...HEAD`. Changed source files: `src/lib/config/platform.ts`, `src/lib/services/ApiService.ts`, `src/routes/setup/+page.svelte`, `tests/unit/services/ApiServiceClientVersion.test.ts`, plus the job docs. Nothing outside tasks.md changed. The only commit since the previous NEEDS WORK verdict is `e5b5c35`, which updates `implementation.md` only, so the source code is the same as in the last review. The uncommitted `.mcp.json` change is not on the branch.

TASK-1: PASS
notes: `platform.ts:18` adds `CLIENT_VERSION = env.PUBLIC_VERSION ?? ''` next to the other env-derived constants. It is the single source. `AppSettings.svelte` is unchanged, as planned.

TASK-2: PASS
notes: `ApiService.ts`. The private `getClientVersionHeader()` is spread into `getAuthHeaderOnly`, both branches of `getApiHeader` and `getApiHeaderWithBody`, and the inline `download()` headers. The 401 retry rebuilds them through `fetchWithRecovery`. When the version is empty, the header is left out. The value is sent as-is. `service-worker.ts` and `ManageWeatherCity.svelte` are correctly left alone.

TASK-3: PASS
notes: `tests/unit/services/ApiServiceClientVersion.test.ts` is a separate file. It isolates the env mock with `resetModules`/`doMock`/`doUnmock`. It covers bodyless and JSON requests with and without a token, form uploads, downloads, the 401 retry, and unset/empty env. I ran it myself and it passes. The existing `ApiService.test.ts` passes unchanged.

TASK-4: PASS
notes: `setup/+page.svelte:34-36` adds the header only when `CLIENT_VERSION` is non-empty. Nothing else changed.

TASK-5: PASS
notes: I reran everything in this session: `npm run check` gives 0 errors and 0 warnings, `npm run lint` is clean, and `npm test` passes 65 files and 943 tests. The browser dev-tools check against a live API was not done, by the owner's explicit decision (recorded in implementation.md). I accept that as the owner's call, not as a code defect.

## Overall

APPROVED

No blockers. One reminder for the owner, not a code change: the API's CORS change (allowing `X-Client-Version`) must be live in prod and on any self-hosted API before this build ships. This is flagged in tasks.md and implementation.md.
