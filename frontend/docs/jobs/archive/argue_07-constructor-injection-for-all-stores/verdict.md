# Verdict: 07 Constructor injection for all stores

id: argue
reviewer: Claude (reviewer agent)
date: 2026-10-13

## Review

Branch verified: `feature/argue_07-constructor-injection-for-all-stores`. Base: `main`. Review surface: `git diff main...HEAD`, which touches 26 `src/lib/state/*.svelte.ts` files plus the job docs. No tests, call sites or other files changed.

TASK-1: PASS
notes: `Translation.svelte.ts`: `auth: Auth;` stays in place and the new `constructor(auth: Auth = getAuth())` assigns it. `Auth` was already imported as a type.

TASK-2: PASS
notes: `Tags`, `UserManagement`, `UserNotifications`, `TimeTracking` now use `(auth = getAuth(), apiService = auth.apiService)`. Declarations stay in place. `UserNotifications.notifications` ($state) is untouched.

TASK-3: PASS
notes: `Clipboard`, `DevRequests`, `Friends`, `Statistics`, `Weather`, `Shortcuts` got the same mechanical conversion. Read by eye; each one is correct.

TASK-4: PASS
notes: The six libraries are converted, and `filterService` stays a field initialiser. In `LinkLibrary`, `auth: Auth;` is still declared among the `$state` fields, as the plan asked.

TASK-5: PASS
notes: `BookLibrary` and `MusicLibrary` take `(auth, apiService, localStorage)`. The `LS_VIEW_KEY` read in each constructor runs after the assignments.

TASK-6: PASS
notes: `Navigation`, `Feeds`, `CheckInData`, `Contacts`, `Calendars` are converted. The constructor work (`loadActiveFeatures`/`loadUsage`/`loadMobileOrder`, `loadView`, date setup) runs after the assignments, and `dragService`/`eventService` stay fields. The one change beyond the plan is in `CheckInData`: `scoredTrackers = $state(this.loadScoredTrackers())` became `$state<CheckInType[]>([])` and is set in the constructor after `localStorage` is assigned. It is documented in implementation.md and it was needed: otherwise the field initialiser would read `this.localStorage` while it is still undefined. The state after construction is the same. I scanned all 26 changed files for other non-`$derived` field initialisers that use `this.`, including multi-line ones, and found none.

TASK-7: PASS
notes: `QuickAdd` takes `(auth, apiService, ts, notifications)` and `Notes` takes `(auth, apiService, localStorage, ts, notifications)`. The type imports were added to the existing import lines (`Translation` and `UiNotifications` are exported classes). `journalService` stays a field, and `loadCollapsedCategories()` runs after the assignments.

TASK-8: not started, which is correct. tasks.md marks it as needing owner confirmation. The STANDARDS.md 15.2 count and the backlog checkbox are now out of date; that is for the owner to decide, not a blocker for this job.

Coverage: no `= getAuth()`, `= getTranslation()` or `= getUiNotifications()` field initialisers are left in `src/lib/state`. `localStorage = new LocalStorageService()` fields remain only in `Auth`, `Theme` and `CookieConsent`, which are out of scope as tasks.md says.

Verification caveat: there is no `node_modules` in the workspace, so neither the developer nor I could run `npm test`, `npm run check` or `npm run lint`. Static review finds no type or ordering problems (every declared field is assigned in the constructor, so strict property initialisation holds). Still, the owner should run all three before merging, especially `tests/unit/stores/CheckInData.test.ts`.

## Security

none (not run; this is a mechanical refactor with no change to data handling)

## Overall

APPROVED

No blockers. The change matches the brief and tasks. The one deviation (`CheckInData.scoredTrackers`) is a necessary correctness fix that keeps behaviour the same.
