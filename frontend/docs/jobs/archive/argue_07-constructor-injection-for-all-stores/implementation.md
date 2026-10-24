# Implementation: 07 Constructor injection for all stores

id: argue
developer: Claude (developer agent)
date: 2026-10-13

## Summary

All 26 stores that used field initialisers for their collaborators (`auth = getAuth();` etc.) now use constructor parameters with defaults, the same shape as `Todos` and `Finances` (STANDARDS.md 15.2). Parameter order is `auth`, `apiService = auth.apiService`, then `localStorage`, `ts` and `notifications` where the store has them. The field declarations stay where they were, now type-only. `new X()` still resolves the same defaults, so no call sites or tests changed. Pure services (`filterService`, `journalService`, `dragService`, `eventService`) are still field initialisers.

## Changes

TASK-1: `Translation.svelte.ts`: `auth: Auth = getAuth()` is now `auth: Auth` plus a new `constructor(auth: Auth = getAuth())`.
TASK-2: `Tags`, `UserManagement`, `UserNotifications`, `TimeTracking` now use the `(auth, apiService)` constructor, and `type Auth` is added to the import.
TASK-3: `Clipboard`, `DevRequests`, `Friends`, `Statistics`, `Weather`, `Shortcuts` got the same conversion.
TASK-4: `Movie`, `Quote`, `Game`, `Recipe`, `Plant`, `LinkLibrary` got the same conversion. `filterService` is unchanged.
TASK-5: `BookLibrary`, `MusicLibrary` now use `(auth, apiService, localStorage)`. The existing `localStorage` reads in the constructor run after the assignments.
TASK-6: `Navigation`, `Feeds`, `CheckInData`, `Contacts`, `Calendars` now use `(auth, apiService, localStorage)`.
  **One change beyond the plan, needed for correctness:** in `CheckInData`, the field initialiser `scoredTrackers = $state(this.loadScoredTrackers())` reads `this.localStorage`. Field initialisers run before the constructor body, so after the conversion this would have thrown. The tasks' ordering analysis missed it because the read is indirect (it goes through a method). Following the `Todos.hideItActive` pattern, the field is now `$state<CheckInType[]>([])` and the constructor sets `this.scoredTrackers = this.loadScoredTrackers()` right after the assignments. The result after construction is the same. I scanned every store for other field initialisers that use `this.` outside `$derived`, and there are none.
TASK-7: `QuickAdd` now uses `(auth, apiService, ts, notifications)` and `Notes` uses `(auth, apiService, localStorage, ts, notifications)`. `type Translation` and `type UiNotifications` are added to the existing imports. `Notes` keeps `journalService` as a field, and `loadCollapsedCategories()` runs after the assignments.
TASK-8: not started. The tasks mark it as needing owner confirmation (docs update to STANDARDS.md 15.2 and STANDARDS_BACKLOG.md).

## Known issues / follow-ups

- **Not verified with tooling:** the worktree has no `node_modules`, and the project rules forbid installing packages without asking. So `npm test`, `npm run check` and `npm run lint` were **not run**. The edits were made with an assertion-checked script (each replaced pattern had to occur exactly once) and the diffs were reviewed by eye. A reviewer should run all three, especially `tests/unit/stores/CheckInData.test.ts` because of the change above.
- TASK-8 (docs counts in STANDARDS.md 15.2 / backlog checkbox) is left for the owner to decide.
- `Auth`, `Theme` and `CookieConsent` still use `localStorage = new LocalStorageService()` as a field. They were out of scope, as listed in tasks.md.
- `.mcp.json` in the repo root has an uncommitted modification that this job did not make (it appears to be session/environment config). I left it uncommitted on purpose.
