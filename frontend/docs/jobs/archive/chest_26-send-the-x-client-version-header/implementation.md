# Implementation: 26 Send the X-Client-Version header

id: chest
developer: claude (agent)
date: 2026-10-14

## Summary

The client now sends `X-Client-Version` on every request to the solyto API: all `ApiService` header builders (including the 401-retry rebuild, which reuses them) and the setup health check. The value is `env.PUBLIC_VERSION` exactly as set (tasks.md assumptions 1 and 3). When it is unset or empty, no header is sent (assumption 2), so dev and test behaviour stays the same.

## Changes

TASK-1: `src/lib/config/platform.ts` adds `export const CLIENT_VERSION: string = env.PUBLIC_VERSION ?? ''` next to the other env-derived constants. `ApiService` and the setup page both read from this one source. `AppSettings.svelte` was left alone, as the tasks said.

TASK-2: `src/lib/services/ApiService.ts` adds a private `getClientVersionHeader()` that returns `{ 'X-Client-Version': CLIENT_VERSION }` or `{}`. It is spread into `getAuthHeaderOnly`, both branches of `getApiHeader` and `getApiHeaderWithBody`, and the inline headers in `download()`.

TASK-3: New `tests/unit/services/ApiServiceClientVersion.test.ts`. It is a separate file so the env mock can't leak into `ApiService.test.ts`. Each test calls `vi.resetModules()` + `vi.doMock('$env/dynamic/public')` and then imports the service again, following the pattern in `platform.test.ts`. The tests check that the header is there on bodyless and JSON-body requests (with and without a token), form uploads, downloads and the 401 retry. They also check that it is absent when `PUBLIC_VERSION` is unset or empty. The existing exact-match tests in `ApiService.test.ts` were not changed and should still pass, because the env is empty there.

TASK-4: `src/routes/setup/+page.svelte` passes `headers: CLIENT_VERSION ? { 'X-Client-Version': CLIENT_VERSION } : {}` to the health check `fetch`. Nothing else changed.

TASK-5: After the owner approved it, ran `npm ci` (the pinned lockfile, so no dependency changes). Then ran all three checks:
- `npm run check`: 0 errors, 0 warnings.
- `npm run lint`: clean.
- `npm test`: 65 files / 943 tests passed. The new `ApiServiceClientVersion.test.ts` ran, and the existing `ApiService.test.ts` exact-match tests pass unchanged.

The owner decided to skip the browser dev-tools check against a live API. It was not done.

## Known issues / follow-ups

- **Deployment gate (from tasks.md):** the API's CORS change, which adds `X-Client-Version` to `Access-Control-Allow-Headers`, must be live in prod and on any self-hosted API before this build ships. Otherwise the preflight fails and so does every request. The setup health check used to be a CORS "simple request" and is now preflighted, so self-hosted instances on an older API will show `urlError` during setup.
- `PUBLIC_VERSION` is set in the external deployment repo. Its format there (`1.2.3` vs `v1.2.3` vs a hash) was not checked. The API ignores values that aren't `x.y.z`, so a wrong format is harmless but means the version isn't recorded.
- `.mcp.json` shows as modified in the worktree. That change comes from the session environment, not from this job, so it was not committed.
