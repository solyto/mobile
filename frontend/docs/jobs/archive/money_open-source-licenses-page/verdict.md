# Verdict: open-source licenses page

id: money
reviewer: reviewer
date: 2026-11-19

## Review

TASK-1: PASS
notes: `scripts/licenses.ts` follows the owner's decision. It is an in-repo collector with no new runtime package. It walks production dependencies and their transitive dependencies (nested before hoisted), plus a hand-kept `BUNDLED_DEV_DEPENDENCIES` list (incl. `@lucide/svelte`). It dedupes by name@version, sorts, and serves the result as `virtual:licenses`. `@types/node` is pinned to 22.20.5 as approved. The Lucide icon copy has not landed, so Lucide is covered through its package, as tasks.md proposed. The follow-up is noted in implementation.md.

TASK-2: PASS
notes: `tests/unit/scripts/licenses.test.ts` uses a temporary fixture tree. It covers resolution (nested, hoisted, scoped, missing), the license-type forms, license-file selection (it ignores `license-checker.js` and walks into `licenses/`), transitive collection, dedupe/sort, and extra roots. It also spot-checks the real `node_modules` for svelte, @lucide/svelte, @tiptap/core, prosemirror-model, echarts, zrender and dompurify. Built chunk `build/client/_app/immutable/chunks/pQVOcHMC.js` contains zrender and @lucide/svelte.

TASK-3: PASS
notes: `src/routes/licenses/+page.svelte` uses `SubHeading` for the title, then one section per package with a monospace `pre` block. It loads the list with a lazy `import()` and makes no `fetch`, so STANDARDS 15.3 is respected and there is no exception. `urls.licenses` is added.

TASK-4: PASS
notes: `NavLegalEntry.svelte` always renders and adds an in-app link (`resolve(urls.licenses)`, no `target`), so it stays inside the Capacitor/Electron shells. The link closes the popover and calls `onSelect`, which closes the mobile overflow menu. `hasLegalUrls` is removed from `urls.ts` and `MobileNavbar.svelte` (item count is now a fixed 4, and the render condition is gone). The button title is a neutral "Legal". The re-indented popover markup is otherwise unchanged.

TASK-5: PASS
notes: `layout.legal` and `layout.open_source_licenses` are in `translation.ts` and all six locales (en, de, es, fr, it, ru).

TASK-6: PASS
notes: Re-run by the reviewer: `npm run check` gave 0 errors and 0 warnings, `npm run lint` was clean, and `npm test` passed 101 files / 1743 tests. The full `npm run build` hits an out-of-memory error in the sandbox's adapter step. That is documented, and the client build output is present. The shell and rendered checks still need a manual look, as noted in implementation.md.

Scope: the diff matches tasks.md. The component and unit test updates follow from removing `hasLegalUrls`. No unrelated refactors.

## Security

none: build-time reads of local `node_modules` only. Nothing is fetched or rendered as HTML at runtime (text goes into `{}` interpolation inside `pre`).

## Overall

APPROVED

No blockers.
