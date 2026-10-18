# Tasks: 07 Constructor injection for all stores

Branch verified: `feature/argue_07-constructor-injection-for-all-stores` (worktree HEAD matches `brief.md`).

## Target shape (STANDARDS.md 15.2, reference `Todos`, `Finances`)

```ts
auth: Auth;
apiService: ApiService;
localStorage: LocalStorageService;   // only if the store has one today

constructor(
	auth: Auth = getAuth(),
	apiService: ApiService = auth.apiService,
	localStorage: LocalStorageService = new LocalStorageService()
) {
	this.auth = auth;
	this.apiService = apiService;
	this.localStorage = localStorage;
	// ...existing constructor body, unchanged, after the assignments
}
```

Rules that apply to every task below:

- **What gets injected:** `auth`, `apiService`, `localStorage`, and the context collaborators `ts` (`Translation`) and `notifications` (`UiNotifications`). **What stays a field initialiser:** pure services (`filterService`, `journalService`, `dragService`, `eventService`), the same as `Todos` keeps `filterService = new TodoFilterService()` as a field. This is my reading of the reference. Pure services are not converted anywhere.
- Parameter order: `auth`, `apiService = auth.apiService`, then `localStorage` if present, then `ts`, then `notifications`. `apiService` has to come after `auth` because its default reads `auth.apiService`.
- Replace the field initialiser with a type-only declaration (`auth: Auth;`) **in the same position**. Do not move members around to match the 15.2 member order. That would be "any other change to the stores" (out of scope).
- Assign the collaborators first in the constructor, then run the existing body unchanged. Several constructors call methods that use `this.localStorage` / `this.apiService` (e.g. `Navigation`, `Notes`, `Todos`).
- Add `type Auth` (and `type Translation`, `type UiNotifications` where needed) to the existing imports. Do not touch other imports.
- No call site changes: `setX()` keeps calling `new X()`.
- No test changes. The module mocks in `tests/unit/setup/storeMocks.ts` (and the Translation/UiNotifications mocks in `Notes.test.ts` / `QuickAdd.test.ts`) keep working, because the defaults still call `getAuth()` etc. Removing those mocks is explicitly out of scope.
- Verify each task with `npm test`, `npm run check` and `npm run lint`. Commit one task at a time (the brief asks for one store or a small batch per commit).

Ordering safety, already checked: no field initialiser in these 26 stores reads `this.auth` / `this.apiService` / `this.localStorage` / `this.ts` / `this.notifications`, so moving the assignment into the constructor changes no init order. `$derived` fields are lazy. Root layout order is `setAuth()` → `setTranslation()` → `setUiNotifications()` → … → `setQuickAdd()`, so the defaults resolve exactly as before.

---

## TASK-1: Convert `Translation` to constructor injection

- **Description:** Replace `auth: Auth = getAuth();` with `auth: Auth;` and add a new `constructor(auth: Auth = getAuth()) { this.auth = auth; }`. The store has no constructor today and no `apiService`.
- **Files:** `src/lib/state/Translation.svelte.ts`
- **Dependencies:** none
- **Risk:** low. It is one field, but there is no unit test for `Translation`, so `npm run check` and the component tests are the only net. `loadLanguage()` already uses `this.auth?.`, so behaviour is unchanged.

## TASK-2: Convert the simple tested stores (auth + apiService)

- **Description:** Convert `Tags`, `UserManagement`, `UserNotifications` and `TimeTracking` to the `(auth, apiService)` constructor shape, as in `Finances`.
- **Files:** `src/lib/state/Tags.svelte.ts`, `src/lib/state/UserManagement.svelte.ts`, `src/lib/state/UserNotifications.svelte.ts`, `src/lib/state/TimeTracking.svelte.ts`
- **Dependencies:** none
- **Risk:** low. The change is mechanical and each store has a unit test. Note: `UserNotifications` already has a `$state` field called `notifications`. It is not the `UiNotifications` collaborator; leave it alone.

## TASK-3: Convert the simple untested stores (auth + apiService)

- **Description:** Convert `Clipboard`, `DevRequests`, `Friends`, `Statistics`, `Weather` and `Shortcuts` to the `(auth, apiService)` constructor shape.
- **Files:** `src/lib/state/Clipboard.svelte.ts`, `src/lib/state/DevRequests.svelte.ts`, `src/lib/state/Friends.svelte.ts`, `src/lib/state/Statistics.svelte.ts`, `src/lib/state/Weather.svelte.ts`, `src/lib/state/Shortcuts.svelte.ts`
- **Dependencies:** none
- **Risk:** low. The change is mechanical, but none of these six has a unit test, so only `npm run check` / lint cover them. Review the diffs by eye.

## TASK-4: Convert the library stores without localStorage

- **Description:** Convert `MovieLibrary`, `QuoteLibrary`, `GameLibrary`, `RecipeLibrary`, `PlantLibrary` and `LinkLibrary` to the `(auth, apiService)` shape. `filterService = new LibraryFilterService()` stays a field initialiser.
- **Files:** `src/lib/state/{Movie,Quote,Game,Recipe,Plant,Link}Library.svelte.ts`
- **Dependencies:** none
- **Risk:** low. All six are covered by `tests/unit/stores/LibraryStores.test.ts`. In `LinkLibrary`, `auth` sits among `$state` fields (line 39); declare it in place without reordering.

## TASK-5: Convert the library stores with localStorage

- **Description:** Convert `BookLibrary` and `MusicLibrary` to the full `(auth, apiService, localStorage)` shape, as in `Todos`. `filterService` stays a field.
- **Files:** `src/lib/state/BookLibrary.svelte.ts`, `src/lib/state/MusicLibrary.svelte.ts`
- **Dependencies:** none
- **Risk:** low. Both are covered by `LibraryStores.test.ts`. Check that any `localStorage` read in the existing constructor body comes after the new assignment.

## TASK-6: Convert the feature stores with localStorage

- **Description:** Convert `Navigation`, `Feeds`, `CheckInData`, `Contacts` and `Calendars` to the `(auth, apiService, localStorage)` shape. `Calendars` keeps `dragService` / `eventService` as field initialisers.
- **Files:** `src/lib/state/Navigation.svelte.ts`, `src/lib/state/Feeds.svelte.ts`, `src/lib/state/CheckInData.svelte.ts`, `src/lib/state/Contacts.svelte.ts`, `src/lib/state/Calendars.svelte.ts`
- **Dependencies:** none
- **Risk:** medium. These constructors do real work (e.g. `Navigation` starts `loadActiveFeatures`/`loadUsage`/`loadMobileOrder`, `Calendars` computes dates and reads storage), so all collaborator assignments must come before the existing body. In `CheckInData`, `localStorage` is declared before `auth`; keep both declarations where they are. Each store has a unit test.

## TASK-7: Convert the stores with Translation/UiNotifications collaborators

- **Description:** Convert `QuickAdd` (auth, apiService, ts, notifications) and `Notes` (auth, apiService, localStorage, ts, notifications). Add `ts: Translation = getTranslation()` and `notifications: UiNotifications = getUiNotifications()` parameters. `Notes` keeps `journalService` as a field initialiser.
- **Files:** `src/lib/state/QuickAdd.svelte.ts`, `src/lib/state/Notes.svelte.ts`
- **Dependencies:** TASK-1 (do `Translation` first so its type is in its final form; this is ordering hygiene, not a hard dependency)
- **Risk:** medium. These are the only stores with more than auth/apiService/localStorage, so the parameter list is longest here. Parameter order and type imports need care. `Notes`' constructor calls `loadCollapsedCategories()`, which reads `localStorage`. Both stores have tests that mock `Translation`/`UiNotifications` by module; those must keep passing unchanged.

## TASK-8 (open question, do not start without confirmation): Update the docs that count the old shape

- **Description:** After TASK-1–7, `STANDARDS.md` 15.2 still says "26 stores still use it and are in the backlog", and `docs/STANDARDS_BACKLOG.md` line 28 has the open checkbox for this item. Both will then be out of date.
- **Files:** `docs/STANDARDS.md` (15.2 paragraph only), `docs/STANDARDS_BACKLOG.md` (tick the item)
- **Dependencies:** TASK-1 to TASK-7
- **Risk:** low. It is a docs-only change. **Unclear scope:** the brief does not ask for doc updates, and `STANDARDS_WORKFLOW.md` may say who updates the standard. Leave it to the owner / reviewer to decide whether this belongs in the job.

---

## Coverage check

26 stores = 1 (T1) + 4 (T2) + 6 (T3) + 6 (T4) + 2 (T5) + 5 (T6) + 2 (T7). This matches `STANDARDS_BACKLOG.md` ("26 stores … including `Translation`").

Not in scope, though they also use `localStorage = new LocalStorageService()` as a field: `Auth`, `Theme`, `CookieConsent`. They are not among the 26 (no `getAuth()` collaborator), and `Auth` cannot take `getAuth()` as a default.
