# Brief: open-source licenses page

type: feature
id: money
branch: feature/money_open-source-licenses-page
date: 2026-11-19
author: Leander Muskalla

## What

The app ships no license notices for the open-source code it bundles. The build
output contains no `@license` comments (checked: none in `build/client`), and there is
no licenses page. Most bundled packages are MIT/ISC-licensed, which require the
copyright and permission notice to be included with copies of the software, and the
web app, the Android app (incl. F-Droid) and the desktop app are such copies.

This becomes more pressing once the Lucide icons are copied into the repo
(`own-copy-of-lucide-icons.md`, done first): that copy's `LICENSE` file has to be shown
somewhere too.

Goal: an "Open-source licenses" page **inside solyto**, generated during the build so it
always matches the exact packages in that build, and linked from the Legal menu.

Facts:

1. **Legal menu.** `src/lib/components/ui/NavLegalEntry.svelte` renders the scale icon
   and a small popover with links to the legal notice, privacy policy and terms. Those
   links come from env config (`src/lib/config/urls.ts`, `PUBLIC_LEGAL_NOTICE_URL` etc.)
   and open the landing page in a new tab. The whole entry is hidden when no legal URL
   is set (`hasLegalUrls`); `MobileNavbar.svelte` also uses `hasLegalUrls` for its item
   count (~line 39) and to render the entry (~line 142).
2. **Build.** `vite.config.ts` has only the Tailwind and SvelteKit plugins; adapter-node,
   output in `build/`. No license-related package is installed.
3. **Lucide after the icon copy.** The icons are no longer an npm package then, so
   anything that collects licenses from bundled packages won't find them. Their
   `LICENSE` file (ISC + MIT for Feather-derived icons) lives next to the copy.

## Suggestion

1. **Generate the license list at build time** from the packages actually bundled into
   the client: package name, version, license type and full license text, deduplicated.
   Two ways; propose one to the owner before building:
   - an existing Rollup/Vite license plugin (e.g. `rollup-plugin-license`). This is a
     **new package: ask the owner before installing it** (project rule);
   - or a small Vite plugin of our own in the repo: in `generateBundle`, take the
     bundled module paths, find each package's `package.json` and `LICENSE` file under
     `node_modules`, and write the list. No new package.
2. **Add the Lucide copy's license explicitly** (from its folder), since no package
   collection will find it.
3. **Show it inside solyto** as an "Open-source licenses" page in the app's normal look
   (title, then one section per package, license text in a readable monospace block).
   A plain generated text file shown by that page is fine. Check that it also opens
   inside the Android (Capacitor) and desktop (Electron) apps, not in an external
   browser.
4. **Link it from the Legal menu** as a new entry next to the existing three. It must
   show even when no legal URLs are configured: show the legal entry whenever there is
   at least the licenses link, and update the `hasLegalUrls`-based logic in
   `NavLegalEntry.svelte` and `MobileNavbar.svelte` accordingly.
5. New UI strings in all locales (`src/lib/i18n/*.ts`), via the translator agent.
6. Verify: `npm run check`, `npm run lint`, `npm test`, `npm run build`; the generated
   list contains the bundled packages (spot-check a few, e.g. Svelte, TipTap, echarts)
   and the Lucide icons; the page opens from the Legal menu on desktop and mobile
   layout.

Out of scope: moving the legal notice, privacy policy or terms into the app (they stay
links to the landing page, so they're always current for everyone, independent of app
releases); server-side (API) licenses; the `mobile/frontend` and `desktop/frontend`
checkouts.

# How to proceed
- Run npm ci first. This will give you all needed packages.

Decision (owner):

1. License list generation: our own small build script, no new package.
   It collects the licenses of all production dependencies, including their
   transitive dependencies, plus the LICENSE file of our Lucide icon copy,
   and writes them into a generated module (package name, version, license
   type, full license text; deduplicated). Being over-inclusive (listing a
   dependency that isn't actually bundled) is fine.

2. No fetch, no exception to STANDARDS 15.3: the licenses page imports the
   generated module directly, as a lazily loaded import, so it is only
   loaded when the page is opened. Nothing is fetched at runtime.

Approved: add @types/node as a devDependency, pinned to an exact 22.x
version (the project runs Node 22), matching the project's pinned-version
convention. Types only; no other new packages.