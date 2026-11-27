# Implementation: open-source licenses page

id: money
developer: developer
date: 2026-11-19

## Summary

An in-app "Open-source licenses" page at `/licenses`, linked from the Legal menu. A small in-repo Vite plugin builds the list as the `virtual:licenses` module. The page loads that module with a lazy `import()`, so it ships as its own chunk and nothing is fetched at runtime (owner decision; no exception to STANDARDS 15.3). The list covers all production dependencies and their transitive dependencies, plus a short list of devDependencies whose code ends up in the client (including `@lucide/svelte`). Each entry has name, version, license type and full license text, deduplicated by name@version and sorted.

## Changes

TASK-1: `scripts/licenses.ts`: collector (`collectLicenses`, `resolvePackageDir`, `licenseType`, `readLicenseText`) and the `licenses()` Vite plugin serving `virtual:licenses`. Also `src/virtual-licenses.d.ts` (module type), `src/lib/types/license.ts` (`OpenSourceLicense`), and `vite.config.ts` (registers the plugin). `@types/node` 22.20.5 added as an exact devDependency (owner-approved) for the `node:fs`/`node:path` types.
TASK-2: `tests/unit/scripts/licenses.test.ts`: fixture-tree tests for package resolution (nested vs. hoisted, scoped names), license type forms, license-file selection, transitive collection, dedupe/sort, plus a check against the real `node_modules` (svelte, @lucide/svelte, @tiptap/core, prosemirror-model, echarts, zrender, dompurify).
TASK-3: `src/routes/licenses/+page.svelte`: `SubHeading` title, then one section per package with the license text in a monospace `pre` block. `urls.licenses` added in `src/lib/config/urls.ts`.
TASK-4: `NavLegalEntry.svelte` always renders and adds an in-app licenses link (`resolve(urls.licenses)`, no `target`, so it stays inside the Capacitor/Electron shells). The link closes the popover and calls `onSelect`, which closes the mobile overflow menu. `hasLegalUrls` is removed from `urls.ts` and `MobileNavbar.svelte` (item count and render condition). The button title is now a neutral "Legal".
TASK-5: New keys `layout.legal` and `layout.open_source_licenses` in `translation.ts` and all locales (en, de, es, fr, it, ru).
TASK-6: Updated the component tests for the new behaviour (`tests/components/nav-legal-entry.test.ts`: "Legal" title, licenses link present, in-app href without target; `tests/components/translation-only.test.ts`: with no legal URLs, only the licenses link shows). Also updated `tests/unit/config/urls.test.ts`. `npm run check` reported 0 errors, `npm run lint` was clean, and `npm test` passed 1743 tests. In the client build output, the lazy licenses chunk contains svelte, @tiptap/core, prosemirror-model, echarts, zrender, dompurify and @lucide/svelte (ISC text).

## Known issues / follow-ups

- `npm run build` runs out of memory in the adapter-node step in this sandbox (~1 GB default heap; the process is killed even with 4 GB). The same happens with the licenses plugin and import removed, so the cause is the environment, not this change. Vite's client and server builds both complete, and `build/client` is written.
- The Lucide icon copy (`own-copy-of-lucide-icons.md`) has not landed. Lucide is covered through the `@lucide/svelte` package. When the copy lands, that job must add its `LICENSE` file to `scripts/licenses.ts` and drop `@lucide/svelte` from `BUNDLED_DEV_DEPENDENCIES`.
- `BUNDLED_DEV_DEPENDENCIES` is a hand-kept list. A new devDependency that gets bundled into the client has to be added there.
- No rendered check with `shot`: the page sits behind the auth guard and there is no API in this sandbox. The page and the Legal menu still need a manual look on desktop and mobile layouts, and inside the Capacitor/Electron shells.
