# Tasks: open-source licenses page

id: money
analyst: analyst
date: 2026-11-19

## Before building: owner decisions

The brief asks for the approach to be proposed to the owner before building. These need an answer first; the tasks below assume the **proposed** option.

1. **Generator: in-repo Vite plugin (proposed) or `rollup-plugin-license`.**
   Proposed: our own small plugin. It needs no new dependency (project rule), and the logic is small: in the client build's `generateBundle`, collect `chunk.moduleIds` from all chunks, map each `node_modules/...` path to its package root (handle scoped `@scope/name` and nested `node_modules`), read `package.json` (name, version, license) and the first `LICENSE*`/`LICENCE*`/`COPYING*` file, dedupe by name@version, sort, and emit one file with `this.emitFile({ type: 'asset', fileName: ..., source })`. It must run only for the client build, not the SSR build adapter-node also runs. `rollup-plugin-license` would need the owner's approval to install.
2. **Lucide: the brief's fact 3 does not match this branch.** `own-copy-of-lucide-icons.md` has not landed: `@lucide/svelte` 1.59.0 is still in `package.json` (as a devDependency, but bundled into the client), and there is no copy in the repo. So package collection *will* find Lucide on its own, and there is no in-repo `LICENSE` to add yet. Proposed: no Lucide special case in this job (TASK-2 checks that Lucide is in the output). The icon-copy job adds its `LICENSE` to the plugin's extra entries when it lands. If the owner wants this job to wait for the icon copy, it should be scheduled after that one.
3. **How the page reads the file vs. STANDARDS 15.3** ("`ApiService` is the only place that calls `fetch`"; the setup health check is the one accepted exception). The list only exists after bundling, so it can't be an imported module. It has to be a build asset that the page loads at runtime. Proposed: emit a fixed-name file at the client root (e.g. `/licenses.txt` or `/licenses.json`) and have the page `fetch` it as a second documented exception, added to 15.3 by the owner. Otherwise the owner names another way.
4. **Format: plain text (allowed by the brief) or JSON.** Proposed: JSON (`[{ name, version, license, text }]`). The page can then render one section per package (title, then a monospace block) without parsing text. A plain `.txt` is the simpler alternative.

Smaller points, flagged rather than guessed:
- `generateBundle` does not run in `npm run dev`, so the page has no file there. Proposed: show the empty state; no dev stub.
- The service worker (`src/service-worker.ts`) only precaches `build` + `files`, so the fixed-name asset is not available offline unless it is added there. Proposed: out of scope unless the owner wants it.
- When only the licenses link exists, the legal button's `title` is still `layout.legal_notice` ("Legal Notice"/"Impressum"), which would be wrong. Proposed: a neutral title string (e.g. "Legal"), as part of TASK-5's i18n.
- The page must not require login? Today the legal menu only appears in the logged-in navbars and `+layout.svelte` redirects non-auth routes to login, so a normal route under the guard is enough. Proposed: keep it behind the guard.

## Task breakdown

TASK-1: Add an in-repo Vite plugin that, for the client build only, collects every bundled `node_modules` package (name, version, license, full license text), dedupes and sorts them, and emits one fixed-name asset at the client output root.
  files: new `vite/licenses.ts` (or similar, outside `src/` and `build/`), `vite.config.ts`, possibly `tsconfig.json`/`eslint.config.js` if the new file is not already covered
  depends: owner decisions 1, 3, 4
  risk: medium — it relies on Rollup/Vite 7 plugin internals (client vs SSR environment detection, `moduleIds` containing virtual/`\0` ids and Vite-prefixed paths), and packages without a LICENSE file or with nested `package.json`s (e.g. `dist/package.json` `{type: module}`) must be resolved to the real package root.

TASK-2: Unit-test the plugin's pure parts (module id → package root, license file selection, dedupe/sort, output shape) with a fixture tree, and spot-check the real `npm run build` output for svelte, @tiptap/*, prosemirror-*, echarts, dompurify and @lucide/svelte.
  files: new `tests/unit/LicenseCollector.test.ts` (or similar), small fixture dir under `tests/unit/fixtures/`, plus splitting pure functions out of the TASK-1 file if needed
  depends: TASK-1
  risk: low — pure functions in node; the only open point is where the plugin's file lives so the `unit` Vitest project and `$lib` alias can import it.

TASK-3: Add the `/licenses` route (`urls.licenses`) that loads the generated asset and renders a `SubHeading` title, then one section per package (name, version, license type) with the license text in a readable monospace block, using existing UI components and the app's normal page layout.
  files: `src/lib/config/urls.ts`, new `src/routes/licenses/+page.svelte`, maybe a type in `src/lib/types/` (e.g. `license.ts`) if JSON is chosen, `docs/STANDARDS.md` 15.3 only if the owner approves the exception
  depends: TASK-1, owner decision 3
  risk: medium — the fetch has to follow whatever the owner decides for 15.3; otherwise low (static read-only page, no store needed because nothing is shared).

TASK-4: Add a "Open-source licenses" link to the Legal popover as an internal in-app link (`resolve(urls.licenses)`, no `target="_blank"`), and show the legal entry whenever there is at least that link: drop or redefine `hasLegalUrls` gating in `NavLegalEntry.svelte`, `MobileNavbar.svelte` (item count ~line 39 and the `{#if}` ~line 142), and `urls.ts`.
  files: `src/lib/components/ui/NavLegalEntry.svelte`, `src/lib/components/ui/MobileNavbar.svelte`, `src/lib/config/urls.ts`, `src/lib/components/ui/DesktopNavbar.svelte` (check only; it renders `NavLegalEntry` unconditionally)
  depends: TASK-3
  risk: low — small markup change; the popover must close on selection so the mobile overflow menu does not stay open after navigating.

TASK-5: Add the new UI strings (page title, link label, empty state, a neutral legal-button title if approved) to `en.ts` and `types/translation.ts`, then hand de/es/fr/it/ru to the `translator` agent.
  files: `src/lib/types/translation.ts`, `src/lib/i18n/en.ts`, `de.ts`, `es.ts`, `fr.ts`, `it.ts`, `ru.ts`
  depends: TASK-3, TASK-4 (keys known)
  risk: low — mechanical; `npm run check` enforces that the locales match.

TASK-6: Verify: `npm run check`, `npm run lint`, `npm test`, `npm run build`; confirm the asset is in `build/client` (and not produced by the SSR build); open `/licenses` from the Legal menu in desktop and mobile layout with no `PUBLIC_*_URL` set and with them set; confirm the link uses in-app navigation (no `target`), so it stays inside the Capacitor/Electron shells.
  files: none (verification), job `implementation.md`
  depends: TASK-1 … TASK-5
  risk: medium — the shell behaviour can only be confirmed by reasoning here (the shells' `mobile/frontend` and `desktop/frontend` checkouts are out of scope). If those builds use a different adapter/output dir, someone has to confirm the client-root asset still ships there.
