# Implementation: svelte best practices

id: cut
developer: deepseek-v4-flash
date: 2026-10-10

<!-- Produced by @developer after implementation. -->

## Summary

Wrote a policy set — four top-level, cross-linked docs in `docs/` — capturing
how the solyto frontend is actually built, so humans and AI contributors write
code that matches the author's style. Every rule is grounded in a real file in
this repo (state stores, components, services, config, types, i18n). This was a
docs-only job: **no files under `src/` were touched.**

Layout decision (analyst's recommended option, confirmed as-is): a small set of
top-level docs — `BEST_PRACTICES.md` (entry point + general in-file rules),
`STATE_SERVICES.md`, `COMPONENTS.md`, `DATA_LAYER.md` — rather than one
monolith or a `docs/policies/` subfolder. `docs/TESTING.md` is referenced, not
rewritten. A short "Coding policies" pointer was added to `docs/AGENTS.md` (and
its mounted root copy `/workspace/AGENTS.md`, per the repo's tracked-mount
pattern) so the set is discoverable in future agent sessions.

## Changes

TASK-1 `docs/BEST_PRACTICES.md` (new) — entry point. Purpose/how-to-use for the
set, readability-first, DRY without premature abstraction (quoting the AGENTS.md
hard rule), small single-purpose functions, early returns / no nested short-ifs
(with before/after example), naming conventions, why-comments (cited the
explanatory comments in `Todos.svelte.ts` `load()` and the `Viewpoint` `if
(browser)` guard), `$derived` discipline (cited `canAccessRoute` in
`src/routes/+layout.svelte`), TypeScript strict + `import type`, exact
formatting/tooling from `.prettierrc`/`eslint.config.js`/`package.json`, the
one-paragraph testing stance pointing at `docs/TESTING.md`, and a related-docs
index.

TASK-2 `docs/STATE_SERVICES.md` (new) — the `src/lib/state/*.svelte.ts` layer:
one class per domain/file, context-singleton pattern (`Symbol` key + `setX()`/
`getX()`, created in root or feature route layouts), `$state` fields, member
ordering, preferred constructor DI with zero-arg-preserving defaults (cited
`Todos`/`Finances`) vs. the older field-initializer style (cited `Clipboard`),
`load()`+`loaded` convention, the intentional CRUD pattern ("if (res) await
this.load(); return ok" — explicitly not to be DRYed up), delegation to
`services/`, `LS_*` persistence keys, guarded `browser`/`page` imports and
`destroy()` cleanup (cited `Viewpoint`), cross-store dependencies (cited
`QuickAdd`), read-only getters, and a "what not to do" list.

TASK-3 `docs/COMPONENTS.md` (new) — the UI layer: lean components that read
stores once at the top of the script and delegate; `$props<{...}>()` typing;
Svelte 5-only syntax (no `on:click`/`createEventDispatcher`/`export let` —
verified zero across `src/`); extracting non-trivial conditions out of markup
(flagged the `todos/props/Title.svelte` inline ternary as an anti-pattern);
preferring shared `ui/`/`forms/` primitives; the desktop/mobile `views`/
`*Mobile.svelte` convention driven by `Viewpoint`; Tailwind `c-*` tokens, `dark:`
variants, `size-*`, `class:` directives and prettier-plugin-tailwindcss
ordering; lucide icons; `ts.get.*` i18n with all four locales in sync; local
`$state`; loading feedback via `getLoadingIndicator()`; `KeyManager`
register/unregister in `onDestroy`; the two intentionally-ignored svelte-check
a11y warnings and the keyboard/tabindex responsibility they waive; and
testability (props-driven leaves, `docs/TESTING.md` §4/§8).

TASK-4 `docs/DATA_LAYER.md` (new) — the non-UI layers and data flow:
one-directional flow (route/component → store → `ApiService` → `/api/v1`), the
client-rendered-only guarantee (no `+page.server.ts`/`+server.ts`/`load`
anywhere — verified), `ApiService` as the single network seam (full method
table with URL placeholders, Bearer auth, null/false error semantics, one-shot
401 recovery), endpoints only in `config/apiRoutes.ts`, pure `*Service.ts` and
`*Helper.ts` rules, per-file `config/` responsibilities (platform URL resolution
order, features, navigation, urls, themes), `types/` mirroring the API (with
the two runtime-value exceptions `check_in.ts`/`quick_add.ts`), the four-locale
typed i18n, and `LocalStorageService` as the only persistence.

TASK-5 `docs/AGENTS.md` (+ root `/workspace/AGENTS.md`) — added a concise
"## Coding policies" section under Architecture pointing to the four new docs
and `TESTING.md`. Deliberately minimal; the rest of AGENTS.md is untouched.
Judgment call (flagging per the task): the pointer extends beyond the strict
"write docs/*.md" brief; it is 8 lines and reversible if the author prefers
AGENTS.md pristine.

TASK-6 Consistency/accuracy pass — re-read all four docs together; verified
every cited file path exists and every named idiom matches the code; fixed
two inaccuracies found (`postFormData` success semantics in the ApiService
table, and `navigation.ts`'s `mobileDefaultOrder`/`mobileVisibleCount` — the
task text's "Clipboard after the TESTING.md refactor" was also corrected:
the refactor only covered `Todos`/`Finances`, `Clipboard` still uses the older
style, which the doc now shows as the "older" example); balanced code fences,
checked table rendering and heading-anchor links; confirmed no `src/**` files
were modified.

## Known issues / follow-ups

- **`docs/AGENTS.md` line 40** says the root `+layout.svelte` "bootstraps every
  state store via setContext". In reality the root layout creates the app-wide
  stores and each feature's stores are created in its own route layout
  (`todos/+layout.svelte`, `libraries/books/+layout.svelte`, …). The new policy
  docs describe the accurate picture; the AGENTS.md summary line was left as-is
  because TASK-5 forbade restructuring it. Worth a one-line future fix.
- **Task text vs. code** for the DI example: the analyst's `STATE_SERVICES.md`
  task text listed "```Todos```, ```Clipboard``` after the TESTING.md refactor"
  as the preferred style, but only `Todos`/`Finances` received the refactor.
  The doc was grounded in the real code instead (preferred: `Todos`/`Finances`;
  older: `Clipboard`/`QuickAdd`).
- **`docs/TESTING.md` §0** describes `new Todos()` as capturing
  `auth.getToken()` into its own `ApiService`; the current code defaults
  `Todos`/`Finances` to the shared `auth.apiService` instance. Not changed (out
  of scope) — if TESTING.md is next touched, that sentence could be aligned.
- Nothing else outstanding; the docs-only scope was respected (`git status`
  shows no `src/**` changes).