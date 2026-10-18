# Verdict: 09 Session monitor and ApiService follow-ups

id: relative
reviewer: @reviewer
date: 2026-10-13

## Review

Branch checked: `feature/relative_09-session-monitor-and-apiservice-follow-ups`. Base is `main` (from `.manigot/manigot.json`). The diff covers `git diff main...HEAD`.
Gates re-run by the reviewer: `npm test` (57 files / 806 tests) green, `npm run check` 0 errors / 0 warnings, `npm run lint` clean.
`grep -rn "new ApiService(" src` finds only `Auth.svelte.ts`. Direct `fetch(` remains only in `ApiService`, `service-worker.ts`, `routes/setup/+page.svelte` (accepted) and `ManageWeatherCity.svelte`, which tasks.md marks as blocked (open question 1).

TASK-1: PASS
notes: The retry-header tests cover the JSON body, no body, FormData/auth-only and token-cleared cases.

TASK-2: PASS
notes: `fetchWithRecovery(endpoint, init, buildHeaders)` calls the same builder for the first request and the retry, and the cast is gone. I checked all 14 call sites: each keeps its original builder. The retry-once and auth-endpoint exclusion are unchanged. The kept comments are the network-error why-line and the `AUTH_ENDPOINTS` note.

TASK-3: PASS
notes: `postWithStatus` now returns a discriminated union, so `res.data.data` is safe after the `!res.ok` early return. Its only caller is `Auth`.

TASK-4: PASS
notes: `SessionMonitor.test.ts` covers registration, hidden/visible, `online`, `destroy()`, and calling `destroy()` twice.

TASK-5: PASS
notes: `src/lib/state/SessionMonitor.ts` keeps the old behaviour: the `browser` guard, no interval while hidden, and check plus restart on show. Cleanups are collected like `Viewpoint` does. `validateSession` stays in `Auth`.

TASK-6: PASS
notes: `Auth.destroy()` is called from `onDestroy` in `+layout.svelte`. No `viewPoint.destroy()` was added, which matches the scope.

TASK-7: PASS
notes: `expireSession()` (logout, then the handler) replaces `logout()` only in the two rejected branches. Logout timing and the transient/rejected split are unchanged. The tests cover rejected recovery, a rejected resume check, a transient failure, an offline failure and an explicit logout.

TASK-8: PASS
notes: The `wasLoggedIn`/`$effect` block and its `browser` guard are removed, and `handleSessionExpired` reproduces the old toast and redirect. The developer flagged that an explicit logout no longer redirects. In practice nothing changes: the only `auth.logout()` caller is `routes/auth/logout/+page.svelte`, an auth route the old effect already skipped. The `browser` import is still used in the markup.

TASK-9: PASS
notes: `ExportSettings` uses `auth.apiService` and `image()`, with `null` as the failure path. The `Accept` header change is open question 2 and is documented in tasks.md and implementation.md.

TASK-10: PASS
notes: All three DELETEs follow the `deleteEvent` pattern and keep their reload behaviour. `deleteOccurrence` replaces placeholders in the same order as before. The tests assert the URL/id and reload or no reload.

TASK-11: PASS
notes: All seven components use `auth.apiService`, and the unused imports are removed.

TASK-12: PASS
notes: The narrating comments are stripped, and the ladder is now named calls (`adoptExternalSession`, `refreshOrTransient`, `expireSession`) in the same order. The single remaining catch line in `validateSession` states a constraint the code can't express, which is acceptable under 10.1.

Scope: there are no changes outside the tasks. `.mcp.json` is modified in the worktree but not committed, and it is not part of the branch diff.

## Security

None run. The reviewer noted no token leaks: the Nominatim call was deliberately not routed through the Bearer-sending `ApiService`.

## Overall

APPROVED

No blockers. Open owner decisions that do not block this merge: open question 1 (`ManageWeatherCity`) and open question 2 (export `Accept` header). After the merge, tick off the `STANDARDS_BACKLOG.md` entries as tasks.md says.
