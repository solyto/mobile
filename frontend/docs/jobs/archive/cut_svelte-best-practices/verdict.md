# Verdict: svelte best practices

id: cut
reviewer: deepseek-v4-flash
date: 2026-10-10

<!-- Produced by @reviewer and/or @security after implementation. -->

## Review

Reviewed the branch `feature/cut_svelte-best-practices` against `main` (base
`main`, per `.manigot/manigot.json`). The diff is docs-only — four new policy
docs, a "Coding policies" pointer in `docs/AGENTS.md`, and the job's own
artefacts. No `src/**` file was changed (`git diff main...HEAD --name-only`
confirms). Every cited file path and idiom was spot-checked against the actual
code.

TASK-1: PASS
notes: `docs/BEST_PRACTICES.md` — entry point + cross-cutting rules. All
citations verified: `Todos.load()` reads as named steps and delegates to
`TodoFilterService`/`TodoSortingService`/`TodoGroupingService` (Todos.svelte.ts
lines 77-102, 57-60); the two "why" comments quoted at lines 157-167 match
Todos.svelte.ts lines 71-74 and 98-99 verbatim; the `$derived` example matches
`src/routes/+layout.svelte:60`; `.prettierrc` matches the formatting section
(useTabs/tabWidth 4, singleQuote, trailingComma none, printWidth 100, both
plugins); `import type` and the two runtime-value type files
(`check_in.ts`/`quick_add.ts`) are correct. Tone/heading convention is
consistent across the set.

TASK-2: PASS
notes: `docs/STATE_SERVICES.md` — grounded as requested. Context-singleton
snippet matches `Clipboard.svelte.ts`; preferred DI snippet matches
`Todos.svelte.ts:62-75` and `Finances.svelte.ts:26-30` exactly; the "older"
field-initialiser snippet matches `Clipboard.svelte.ts:10-15`; `LS_HIDE_IT_KEY`
value and the CRUD pattern match; `Viewpoint`'s `if (browser)` guard,
`private _state`, getters and `cleanup[]`/`destroy()` all match
`Viewpoint.svelte.ts`; `QuickAdd` cross-store deps match `QuickAdd.svelte.ts`;
the legacy direct-`fetch` exception in `Calendars` is real (3 calls). Minor,
non-blocking accuracy nit: the app-wide store list omits `UserNotifications`
and `Theme`, both created in `src/routes/+layout.svelte` (lines 44 and 51);
the list is not phrased as exhaustive, so no fix is required.

TASK-3: PASS
notes: `docs/COMPONENTS.md` — grounded. `$props<{...}>()` example reproduces
`forms/TextInput.svelte` (the doc's type block lists `oninput`); the
`Title.svelte` ternary anti-pattern and `role="button" tabindex="0"` caveat
match `Title.svelte:76-78,84-88`; the `KeyManager` pattern
(`registerKeyDown`/`unregisterAll` in `onDestroy`) matches `Title.svelte:33-38`;
all cited view paths exist (`todos/views/{ListView,CardView,OverviewView,KanbanView}`,
`todos/TodoNavigationMobile.svelte`, `calendars/views/**/Mobile*View.svelte`);
`ui/ConfirmationModal`, `ui/ContentModal`, `BottomSheetModal` all exist;
`@lucide/svelte/icons/*`, `ts.get.*`, the two ignored a11y warnings and
`docs/TESTING.md` §4/§8 references are accurate.

TASK-4: PASS
notes: `docs/DATA_LAYER.md` — grounded. `ApiService` method table matches
`ApiService.ts` (list/get/create/createWithStatus/delete/update/post/
postWithStatus/postRaw/put/postFormData/uploadFile/image, null/false
semantics, `%s`/`%d`, Bearer header, one-shot 401 recovery + `AUTH_ENDPOINTS`
exemption). Confirmed zero `+page.ts`/`+layout.ts`/`+server.ts` under
`src/routes`. `apiRoutes` composition and `as const` match
`config/apiRoutes.ts`. `platform.ts` resolution order (dev →
`PUBLIC_API_URL` → hostname map → fallback), `features.ts`, `navigation.ts`
(`desktopOrder`/`mobileDefaultOrder`/`mobileVisibleCount`), `urls.ts`,
`themes.ts` all correct. `LocalStorageService` guards `browser` and exposes
the named helpers; the only runtime-value type files are
`check_in.ts`/`quick_add.ts`; four i18n locales typed by `LanguageFile`. Minor,
non-blocking nit: "Keys are `snake_case` strings" has one exception in the
codebase (`Notes.LS_COLLAPSED_CATEGORIES_KEY = 'notes.collapsedCategories'`).

TASK-5: PASS
notes: `docs/AGENTS.md` — a concise "## Coding policies" section was added
after the Data-flow bullet, linking the four new docs and `TESTING.md`; the
rest of the file is untouched, as required. The judgment call (extending
beyond strict `docs/*.md`) is explicitly flagged in `implementation.md`.

TASK-6: PASS
notes: Cross-links and anchors are valid (e.g. `#the-crud-method-pattern`,
`#derived-discipline`, `#early-returns--no-nested-short-ifs`,
`#the-context-singleton-pattern`); headings/tone/"Related docs" are uniform
across the four files; code fences are balanced. The pass caught and fixed two
real inaccuracies (`postFormData` semantics, `mobileDefaultOrder`/
`mobileVisibleCount`) per `implementation.md`. Only remaining drifts are the
minor nits noted under TASK-2/TASK-4.

## Security

Not applicable — documentation-only change, no executable code, no secrets,
no `.env*`/token handling touched. No security findings.

## Overall

APPROVED

Nothing is required to change before merge. The job does exactly what the
brief asked: a grounded, cross-linked policy set under `docs/` that matches
the repo's real idioms, with the optional AGENTS.md pointer added and clearly
flagged. Scope is respected (no `src/**` changes). All statements spot-checked
against the code are accurate; the few residual imprecisions (app-wide store
list not exhaustive; one non-snake_case storage key; store class referred to
as `Viewpoint` vs `ViewPoint`) are cosmetic and non-blocking.

Observation (non-blocking, environmental): the working tree shows the root
`AGENTS.md` as modified/uncommitted. It is a tracked duplicate of
`docs/AGENTS.md` used as the read-only mount path; the committed deliverable
correctly targets `docs/AGENTS.md` only, so this dirty path is a mount
artefact, not a missing change.
