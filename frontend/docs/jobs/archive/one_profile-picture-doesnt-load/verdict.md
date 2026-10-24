# Verdict: profile picture doesnt load

id: one
status: open
reviewer: glm-5.2 (via manigot)
date: 2026-08-17
re-reviewed: 2026-08-18

## Review

Reviewed against `main` (base branch per `.manigot/manigot.json`). Note on
surface: `git diff main...HEAD` contains only job scaffolding — **all
implementation is unstaged in the working tree** because the developer session
ran with a read-only git mount (every `git add`/`git commit` failed with
`Unable to create '…/index.lock': Read-only file system`; documented in
implementation.md). The review therefore covers the working-tree diff plus the
untracked job-dir artifacts. No render report exists (`shot` refuses read-only
sessions).

TASK-1: PARTIAL
notes: Evidence captured without a browser: the deployed production SW bundle
was fetched from https://my.solyto.app/service-worker.js and proven identical
to this repo's handler (`aj-cache-`, `/api` guard, offline body — snapshot at
repro/prod-service-worker.js), and the production SW registration snippet
(deployment-injected, absent from this repo) was verified live on
my.solyto.app and app.solyto.de. A dependency-free repro harness is committed
(repro/server.mjs + prod/ + fixed/ scenarios, server-verified serving both).
However, the actual reproduction was never *observed in a browser* — the shot
tool refused to run — so the "PICTURE BROKEN → PICTURE LOADED" demonstration
is unexecuted. This merges into the TASK-7 blocker below.

TASK-2: PARTIAL
notes: Suspect A (auth payload race) was eliminated by sound
symptom-signature reasoning (a missing `profile` would render the letter
placeholder and persist via `Auth.save()`, so reload would NOT fix it — the
opposite of the reported behavior; findings.md §TASK-2). Strictly empirical
payload inspection of /auth/refresh and /users/me was not possible (requires
auth credentials). The reasoning is sufficient for the TASK-6 skip decision;
not a blocker.

TASK-3: PASS
notes: Complete trace with production evidence: fetch handler skips only
non-GET and /api paths (src/service-worker.ts:45-49 pre-change) → cross-origin
/storage/user/… intercepted → opaque no-cors response (status 0) never passes
the status-200 cache guard → catch path answers the <img> with the synthetic
503 text/plain Response on transient cold-start failure → no retry → broken
until reload (warm network). Explains "sometimes", "first load only", and
"reload fixes it". Verified against the live deployed bundle.

TASK-4: PASS
notes: src/service-worker.ts — early return unless same-origin GET
(`url.origin !== sw.location.origin`). Correct and minimal. Regression surface
checked: every other cross-origin request the app makes (API JSON) was already
skipped via the /api prefix, fonts (@fontsource) and theme CSS are same-origin,
push/SW scope unaffected. Redundant /api skip retained — harmless. Compiled
bundle build/client/service-worker.js contains the guard (build verified).
Users get the new SW only after the next deploy/version bump — documented.

TASK-5: PASS
notes: src/lib/components/ui/NavProfileEntry.svelte — onerror retries once
with ?retry=1 cache-buster, then falls back to the existing initial-letter
placeholder; $effect resets retry state when the image path changes. No retry
loop possible (attempts 0→1→failed). Covers DesktopNavbar AND MobileNavbar
(shared component). svelte-check 0/0, eslint + prettier clean, all 362 unit
tests pass.

TASK-6: PASS
notes: Skipped exactly as the tasks.md conditional prescribes; skip rationale
documented in findings.md. No code touched in Auth.svelte.ts — correct.

TASK-7: PARTIAL
notes: Automated verification fully green: `npm run check` (0 errors/0
warnings), `npm test` (34 files, 362 tests), eslint + prettier on changed
files, `npm run build` with guard present in compiled SW. NOT done: the manual
cold-load / reload / offline browser matrix. Without a single observed browser
run, the end-to-end fix claim rests on code reading plus an unexecuted harness
— not acceptable for a change to the PWA's global fetch handling. Blocker (see
below).

Commit discipline: FAIL (environmental) — zero task commits exist on the
branch; required format `[one] TASK-N: …` unfulfilled. The developer session's
git mount was read-only; implementation.md documents this and proposes the
correct commit split. Fixable host-side without rework.

Scope: clean. Only tasks.md-specified files changed (src/service-worker.ts,
src/lib/components/ui/NavProfileEntry.svelte, job-dir docs). The repro/ harness
under the job dir slightly exceeds TASK-1's "no code changes" (it is code, but
job-dir evidence tooling, not app code) — accepted. The unrelated working-tree
noise (modified AGENTS.md — a manigot read-only bind mount artifact — and the
deleted .opencode/jobs/highlight_* files — a stale mount-path collision) predates
this job and must NOT be swept into this branch's commits. apiRoutes.ts
pre-existing prettier drift left untouched — correct. `npm ci` bootstrap made
no dependency changes (pinned lockfile) — acceptable, documented.

## Security

None. No secrets in any artifact (the prod SW snapshot is a publicly served
asset; findings/implementation reference endpoints only). The SW change
narrows interception scope rather than broadening it. No new dependencies,
no i18n changes.

## Overall

NEEDS WORK

The engineering is merge-quality: root cause confirmed with production
evidence, both fixes minimal and correct, all automated gates green. Two
blockers remain before merge:

1. **Commit the work** (host-side or from a session with a writable git mount)
   using the per-task split already proposed in implementation.md:
   - `[one] TASK-1..3: findings + repro harness for broken profile picture`
     (findings.md, repro/, tasks.md)
   - `[one] TASK-4: service worker handles same-origin requests only`
     (src/service-worker.ts)
   - `[one] TASK-5: retry once and fall back to initial letter on profile image error`
     (src/lib/components/ui/NavProfileEntry.svelte)
   - `[one] implementation: profile picture first-load fix` (implementation.md)
   Stage ONLY the files above; leave AGENTS.md and the .opencode deletions
   alone.
2. **Execute the manual verification matrix from TASK-7**: run
   `node repro/server.mjs` and open http://127.0.0.1:8199/prod/ (must show the
   broken picture with the pre-fix SW handler) and http://127.0.0.1:8199/fixed/
   (must self-heal after one retry), or equivalently cold-load a staging deploy
   with the new SW. Record the observation in implementation.md.

## Re-review (2026-08-18)

Both blockers from the initial review are resolved:

1. **Commits** — done in the prescribed split on this branch: `3251313`
   `[one] TASK-1..3: findings + repro harness…`, `8ef3297` `[one] TASK-4:
   service worker handles same-origin requests only` (`src/service-worker.ts`),
   `611116a` `[one] TASK-5: retry once and fall back to initial letter on
   profile image error` (`NavProfileEntry.svelte`), `d1f7b4c` implementation +
   verification evidence. The pre-existing working-tree noise (AGENTS.md mount
   artifact, .opencode deletions) was correctly left out. Commit discipline: PASS.
2. **Browser verification** — executed 2026-08-18 in a real headless browser
   against the harness: `/prod/` verdict element "PICTURE BROKEN (no retry,
   stays broken until reload)" (bug reproduced with the pre-fix SW handler),
   `/fixed/` verdict element "PICTURE LOADED (after one retry — self-healed, no
   reload needed)". Screenshots + render reports committed under `screenshots/`;
   the api-origin log corroborates (first `/storage/user/pic.png` destroyed at
   socket level, `?retry=1` answered 200 PNG). TASK-7: PASS.

Gates re-run independently during this re-review, all green: `npm run check`
(0 errors / 0 warnings), `npm test` (34 files, 362 tests), prettier + eslint
clean on both changed files. Harness mechanics spot-checked via curl: both
scenario pages serve; after `/ping` the first storage request is destroyed at
socket level (curl exit 000) and the second returns 200 PNG — the committed
browser evidence matches live behavior.

The only render-report finding remains a WCAG contrast complaint about the
harness's own log `<pre>` — harness cosmetics, not app code.

## Overall (final)

APPROVED

Engineering was already merge-quality at first review; both blockers (missing
commits, unexecuted browser matrix) are now resolved with committed evidence.
Remaining steps are host-side and outside this repo's control: merge to `main`
(base branch has moved — 8 commits ahead of this branch at re-review time),
archive the job dir, and deploy so installed service workers pick up the
same-origin guard on the next version bump.
