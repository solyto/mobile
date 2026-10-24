# Tasks: svelte best practices

id: cut
status: open
analyst: deepseek-v4-flash
date: 2026-10-10

<!-- Produced by @analyst from brief.md. -->

## Context

The brief asks for a **policy set of how we build things in solyto** — a
conventions/standards guide that a human (and, importantly, an AI agent) can
follow so new code matches the existing style: "easy-to-read, specific state
services, dry, functions don't do too much, components are lean, no nested
short-ifs, no unnecessary reliance on `$derived`, etc." The deliverable is
**documentation written to `docs/*.md`**. This is a **docs-only job: no files
under `src/` are changed.**

This is a frontend-only repo. The conventions must be **grounded in the actual
code**, not generic Svelte advice — the value is capturing the author's real
idioms: the `setX()`/`getX()` context-singleton stores, `auth.apiService`,
endpoints only via `config/apiRoutes.ts`, `ts.get.*` i18n, `$state` class
fields, constructor DI with defaults, `import type`, Tailwind `c-*` theme
tokens, desktop/mobile view variants, early returns, and "comments explain why".

### What already exists (do not duplicate)

- `docs/AGENTS.md` — the project context/architecture summary loaded every
  session. The policy docs should be **consistent with it** and are the natural
  detail behind its "Architecture" and "Hard rules" sections.
- `docs/TESTING.md` — an existing, single-topic testing policy. The policy set
  must **reference/summarise** it, not rewrite it.

### Deliverable layout (analyst decision)

Produce a **small, focused set of top-level docs in `docs/`** rather than one
monolith. The brief says "policy set" and "`docs/*.md`", each area is a
different concern, and smaller docs are easier to read and to point agents at
(the repo already uses one topical doc per concern — `TESTING.md`). The set:

| Doc                     | Owns                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `docs/BEST_PRACTICES.md`| Entry point + general in-file code principles (applies everywhere)   |
| `docs/STATE_SERVICES.md`| The `src/lib/state/*.svelte.ts` layer                                |
| `docs/COMPONENTS.md`    | The `src/lib/components/**` and `src/routes/**` UI layer             |
| `docs/DATA_LAYER.md`    | `services/`, `helpers/`, `config/`, `types/`, `i18n/`, data flow     |

If the author would rather have a **single** `docs/BEST_PRACTICES.md` containing
all of it, that is a trivial merge of the four files — see Notes; do not
silently pick the other option.

## Task breakdown

TASK-1: Write `docs/BEST_PRACTICES.md` — the entry point and the general, cross-cutting engineering principles that every other doc assumes.
     content: purpose and how to use the policy set (for humans and for AI contributors); "readability first" as the top rule; DRY *without* premature abstraction (tie to the AGENTS.md hard rule "do not add abstractions not already present"); small, single-purpose functions; explicit **early returns** and **no nested short-ifs / no `else` after a `return`** (show the preferred shape); naming (booleans, handlers, stores); comments that explain **why**/non-obvious constraints (cite the explanatory comments in `src/lib/state/Todos.svelte.ts` `load()` and `src/lib/state/Viewpoint.svelte.ts`), not "what"; `$derived` discipline — use it only for genuine derivations read in the template, not as a dumping ground for transforms that belong in a function/service or a `$state` set by a method (cite `src/routes/+layout.svelte`'s `canAccessRoute` as the legitimate use); TypeScript strict + `import type`; formatting/tooling (4-space tabs, single quotes, `printWidth: 100`, prettier + `prettier-plugin-svelte`/`tailwindcss`, eslint, `npm run check`); the **testing stance** — one short section that points at `docs/TESTING.md` and states the rule "test logic and contracts, not markup, not third-party internals"; a short "related docs" index linking the three sibling docs. Establish a consistent heading/tone convention the sibling docs follow.
     files: docs/BEST_PRACTICES.md
     depends: none
     risk: low — documentation only; sets the shared tone for the other docs, so it should land first.

TASK-2: Write `docs/STATE_SERVICES.md` — the policy for the state-service layer (`src/lib/state/*.svelte.ts`), grounded in real examples.
     content: one runes class per domain, one file per domain; the context-singleton pattern (private `Symbol` key + `setX()`/`getX()` pair, instances created once in `src/routes/+layout.svelte`); reactive state as `$state` class fields; **member ordering** (state fields → collaborators/deps → constructor → methods); **constructor dependency injection with defaults that preserve zero-arg construction** (`auth = getAuth()`, `apiService = auth.apiService`, `localStorage = new LocalStorageService()`) — contrast the preferred injectable style (`Todos`, `Clipboard` after the TESTING.md refactor) with the older field-initializer style and codify the preferred one; the `load()` + `loaded` flag convention; the **CRUD method pattern** (call `ApiService`, `if (res) await this.load()`, return boolean) and an explicit note that its repetitiveness is intentional, not something to "DRY up" with a generic helper; delegate pure logic to `services/` (e.g. `Todos` → `TodoFilterService`/`TodoSortingService`/`TodoGroupingService`/`TodoRelevanceService`); persistence via `LocalStorageService` with a `static readonly LS_*_KEY` (cite `Todos.LS_HIDE_IT_KEY`); use of `page` from `$app/state` and `browser` from `$app/environment` (guards!), plus lifecycle/`destroy()` cleanup (cite `Viewpoint`); stores may read other stores/translation (cite `QuickAdd`); read-only view state via getters (cite `Viewpoint`); what **not** to do (no markup/UI, no hardcoded API URLs, no inline `fetch` where `ApiService` exists, keep methods small). Cross-link `docs/BEST_PRACTICES.md` and `docs/DATA_LAYER.md`.
     files: docs/STATE_SERVICES.md
     depends: TASK-1
     risk: low — documentation only; source is well understood from TASK files and the codebase.

TASK-3: Write `docs/COMPONENTS.md` — the policy for Svelte components (`src/lib/components/**` and `src/routes/**` `.svelte` files), grounded in real examples.
     content: components are **lean** — read context stores once at the top of `<script lang="ts">` (`const todos = getTodos();`) and delegate logic to the store/service; type props with `$props<{...}>()`; Svelte 5 syntax (event attributes like `onclick`, snippets, `{@render children?.()}`) — no Svelte 4 `on:click`/`createEventDispatcher`/`export let`; keep markup declarative and **extract non-trivial conditions into functions or booleans** rather than nesting short-ifs/ternaries in markup (cite the long ternary class in `src/lib/components/todos/props/Title.svelte` as an anti-pattern to flag); prefer the shared `ui/` and `forms/` primitives over hand-rolled controls; the desktop/mobile split convention (`views/`, `*Mobile.svelte`, `Viewpoint`); Tailwind conventions (`c-*` theme tokens, `dark:` variants, class ordering via `prettier-plugin-tailwindcss`, `size-*`, `class:` directives); icons from `@lucide/svelte/icons/*`; i18n via `ts.get.*` (all four locale files stay in sync); local UI state via `$state`; loading feedback via `getLoadingIndicator()`; keyboard handling via `getKeyManager()` register/unregister in `onDestroy` (cite `Title.svelte`); accessibility caveats (the two intentionally-ignored `svelte-check` warnings mean a click handler must still get keyboard/tabindex handling); testability (props-driven leaves are the cleanest targets — cite `docs/TESTING.md` §8). Cross-link `docs/STATE_SERVICES.md`.
     files: docs/COMPONENTS.md
     depends: TASK-1
     risk: low — documentation only.

TASK-4: Write `docs/DATA_LAYER.md` — the policy for the non-UI layers (`services/`, `helpers/`, `config/`, `types/`, `i18n/`) and the app's data flow.
     content: the one-directional data flow (route/component → state store → `ApiService` → REST API at `/api/v1`) and the fact that **all routes are client-rendered** (no `+page.server.ts`/`+server.ts`/`load` functions anywhere) so data is fetched by stores, not by routes; `ApiService` is the **single network seam** (`list/get/create/update/delete/post/put/postFormData`, Bearer token from `Auth`, `%s`/`%d` URL placeholders, JSON/FormData bodies, null/boolean error semantics) — never call `fetch` directly for app data; endpoints live **only** in `src/lib/config/apiRoutes.ts`, composed from `getApiUrl()` + `/api/v1`; pure domain `services/*Service.ts` (no constructor side-effects, one responsibility, unit-tested) with the naming convention; pure `helpers/*Helper.ts`; `config/` responsibilities (`platform.ts` web/desktop/mobile + API URL resolution order, `features.ts` flags, `navigation.ts`, `urls.ts`, `themes.ts`); `types/` one file per domain mirroring the API, always `import type` (note the two files with runtime values, `check_in.ts`/`quick_add.ts`); `i18n/` — `en/de/es/fr` kept in sync and typed via `types/translation.ts`, read through `getTranslation().get`; `LocalStorageService` is the only persistence. Cross-link `docs/STATE_SERVICES.md` and `docs/AGENTS.md`.
     files: docs/DATA_LAYER.md
     depends: TASK-1
     risk: low — documentation only.

TASK-5: Add a short "Coding policies" pointer to `docs/AGENTS.md` so the policy set is discoverable and loaded into future agent sessions.
     content: append a concise section (or a few bullets under an existing heading) linking to `BEST_PRACTICES.md`, `STATE_SERVICES.md`, `COMPONENTS.md`, `DATA_LAYER.md` and pointing at `TESTING.md`. Keep it to a handful of lines; do **not** restructure or rewrite AGENTS.md. This is a **judgment call** (an extension beyond the strict "write docs/*.md"): if the author prefers AGENTS.md untouched, this task is dropped and nothing else changes — flag that in the implementation notes rather than deciding silently.
     files: docs/AGENTS.md
     depends: TASK-1, TASK-2, TASK-3, TASK-4
     risk: low — small doc edit; but it touches the shared project-context file, so the author/reviewer should confirm the pointer is wanted.

TASK-6: Consistency, cross-reference, and accuracy pass over the whole policy set.
     content: re-read all four docs (plus the AGENTS.md pointer) together; remove contradictions and duplication; make headings/tone/cross-links uniform; verify **every** cited file path exists and every claim matches the code (spot-check each referenced idiom against the file it names); ensure the sibling docs actually follow the principles stated in `BEST_PRACTICES.md`; confirm the markdown renders (tables, code fences); and confirm no `src/**` or other source file was modified. Fix as needed.
     files: docs/BEST_PRACTICES.md; docs/STATE_SERVICES.md; docs/COMPONENTS.md; docs/DATA_LAYER.md; docs/AGENTS.md
     depends: TASK-2, TASK-3, TASK-4, TASK-5
     risk: low — documentation-only review pass.

## Notes / open questions

- **Doc layout is an analyst decision, not settled by the brief.** The brief says
  "policy set … `docs/*.md`". I split it into four top-level docs (see Context).
  Merging them into one `docs/BEST_PRACTICES.md` instead is a trivial
  reorganization — if the author prefers one file, do that; if they prefer a
  `docs/policies/` subfolder, adjust the paths. Flag the chosen layout in the
  implementation notes.
- **No source changes.** This job only adds policy documents (and optionally the
  AGENTS.md pointer). Implementing any rule, or retro-fitting existing code to it,
  is out of scope and should become separate jobs.
- **Do not duplicate `docs/TESTING.md`.** The policy set references it and states
  the testing philosophy in one short section; the detailed coverage plan stays
  where it is.
- **Grounding requirement.** Every rule should cite a real file/idiom from this
  repo (state stores, components, services, config) — a generic Svelte style guide
  would not achieve the brief's goal of making AI output match the author's style.
- **Branch:** `brief.md` specifies `feature/cut_svelte-best-practices`. This
  analyst session had no shell, so `git branch --show-current` could not be run;
  the mounted worktree is assumed to be on the job branch (per the pipeline's
  worktree guarantee). No `git checkout` is needed.
- **No render report / screenshots exist for this job** (it produces docs, not UI),
  so no rendered ground truth is relevant.
