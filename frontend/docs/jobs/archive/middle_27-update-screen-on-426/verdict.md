# Verdict: 27 Update screen on 426

id: middle
reviewer: @reviewer
date: 2026-10-15

## Review

Branch verified: `feature/middle_27-update-screen-on-426`. Reviewed `git diff main...HEAD`.
Every changed file is listed in `implementation.md`, and nothing outside the task list changed.

TASK-1: PASS
notes: `src/lib/services/ApiService.ts:54-57`. The 426 check runs before the 401 branch.
There is no retry and no call to the unauthorized handler, and the response is returned
unchanged, so callers keep their `null`/`false` results. `readMinClientVersion` reads
`res.clone().json()` inside a try/catch and type-checks the field. When no handler is set,
the body is never read. Non-blocking gap: the post-recovery retry at line 66 is not checked
for 426, so 401 → refresh → retry → 426 would go unreported. The next request would report
it, so this is not a blocker.

TASK-2: PASS
notes: `tests/unit/services/ApiService.test.ts:425-508` covers everything the task listed:
- the min version, or `null` for a missing field or a non-JSON body;
- the unauthorized handler is never called, and fetch is called once;
- `list`/`get` resolve `null` and `update`/`delete` resolve `false`;
- `postRaw` can still read the body;
- without a handler, `clone()` is never called.

The mock's `clone()` is consistent with the implementation. Not executed (see TASK-7).

TASK-3: PASS
notes: `src/lib/state/UpdateRequired.svelte.ts` is a plain `$state` class with the usual
set/get context pair. It matches the plan.

TASK-4: PASS
notes: The `UpdateRequiredRecords` type is added, and all eight keys are present in
en/de/es/fr. Each file is wired into `LanguageFile`.

TASK-5: PASS
notes: `src/lib/components/ui/UpdateRequiredScreen.svelte`:
- the platform instruction is chosen via `IS_DESKTOP`/`IS_MOBILE`, with web as the fallback;
- the reload button is shown on web only;
- there is no `$effect` and no `$derived`;
- `TextButton`'s props match.

Non-blocking: in `reloadLatestVersion`, if `registration.update()` rejects (for example
offline, or the SW script fetch fails), `location.reload()` never runs and the button
silently does nothing.

TASK-6: PASS
notes: `src/routes/+layout.svelte:79-84`. The handler is registered synchronously after
`setSessionExpiredHandler`. `Auth.load()` only reaches the network after an `await`, so
registration happens first. When `required` is set:
- the update screen replaces the children, both navbars and WelcomeTour;
- QuickAdd is gated off;
- TitleBar stays.

The login, redirect and session logic is unchanged. A 426 cannot reach `expireSession`:
`performRefresh` maps only 401/403 to `rejected`.

TASK-7: FAIL
notes: Nothing was verified. `implementation.md` says outright that `npm run check`,
`npm run lint`, `npm test` and the manual run against a local API with
`MIN_CLIENT_VERSION` were all **not run**: the worktree has no `node_modules` and no API
was reachable. The brief makes these the job's safety requirement ("tests for the status
handling, `check`, plus a manual run…"). The SW reload behaviour (open question 3) is also
unconfirmed. I could not run them either, because there is no `node_modules` here and
installing packages needs the owner's approval.

## Security

Not run. No new external input reaches the DOM except `min_client_version`, which is
rendered as text via Svelte interpolation. No token or user data is logged.

## Overall

NEEDS WORK

The code looks correct and complete against tasks 1–6. It cannot be merged until the brief's
required verification has actually been done:

1. Run `npm run check`, `npm run lint` and `npm test` (after an approved `npm ci`). All must
   pass, including the seven new 426 tests. Record the results in `implementation.md`.
2. Do the manual run from the brief against a local API (`solyto/api` `c5f3b99`+) with
   `MIN_CLIENT_VERSION` above the build's `PUBLIC_VERSION`:
   - the update screen appears;
   - there is no logout and no session-expired toast;
   - auth and health still work.
   Then run once with the check off; the app should be unchanged. Record the results in
   `implementation.md`.
