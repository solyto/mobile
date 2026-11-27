# Brief: switch the app to our own copy of the Lucide icons

type: feature
id: peace
branch: feature/peace_switch-the-app-to-our-own-copy-of-the-lucide-icons
date: 2026-11-19
author: Leander Muskalla

## What

Copy the full Lucide icon set (currently `@lucide/svelte` 1.59.0, 1,891 icons) into
this repo once, switch every icon import in the app to the copy, and remove the
`@lucide/svelte` dependency.

Why: the check-in extension lets users pick an icon for their own trackers, from all
Lucide icons, and stores the icon's name. Lucide renames icons now and then (it keeps
old names only as aliases, which can later be dropped), and we don't want to follow
those renames. With our own copy, names never change unless we change them. Using the
copy everywhere avoids having two sources for the same icons. The tracker icon picker
itself is not part of this task; it comes with the check-in work.

Facts:

1. **Imports are uniform.** 459 imports in 165 files, all
   `import IconX from '@lucide/svelte/icons/<name>'` (default import, one icon per
   path). No barrel imports, no type imports, no `setLucideProps`/context use. Props
   used on icons: `class` (290×), `size` (62×), `fill` (4×).
2. **Package layout.** Each icon in `node_modules/@lucide/svelte/dist/icons/<name>.svelte`
   is a thin wrapper: an `iconData` object (`name`, `size`, `node` = the SVG shapes)
   passed to the shared `../Icon.svelte`. Each file also carries a large base64
   `@preview` comment, which isn't needed.
3. **License.** `node_modules/@lucide/svelte/LICENSE`: ISC, plus MIT for the icons
   derived from Feather (listed in the file). Both require the copyright and
   permission notice to be included with copies.
4. **Existing own icons.** `src/lib/components/ui/icons/` already holds a few custom
   icons (`IconWater`, `IconPlate`, `IconYoga`, …). They stay as they are.

## Suggestion

1. Copy the icons into their own folder (e.g. `src/lib/icons/lucide/`), keeping **one
   small file per icon** under the same file names as in the package, plus `Icon.svelte`
   and whatever it needs (defaults, utils). Generate the copy with a one-off script
   rather than by hand; the script doesn't need to stay in the repo. Drop the `@preview`
   comments. Keep the icon's `node` data as plain data in each file, so the later picker
   can load individual icons on demand.
2. Put Lucide's `LICENSE` file, unchanged, into that folder, and add a short note (in
   the folder's README or the license file's header) saying which Lucide version the
   copy was taken from (1.59.0).
3. Replace every `@lucide/svelte/icons/<name>` import path with the new path. Purely
   mechanical; do it with a script, not by hand. No other changes in those files.
4. Remove `@lucide/svelte` from `package.json` and the lock file. (Removing, not
   installing; no new packages.)
5. The props the app uses (`class`, `size`, `fill`) must keep working exactly as
   before; rendered output should be identical.
6. Verify: `npm run check`, `npm run lint`, `npm test` and `npm run build` pass; no
   remaining `@lucide/svelte` reference in `src/`, `tests/` or config; the built
   client bundle isn't noticeably larger than before (only used icons may be bundled,
   as today). Spot-check a few screens in the browser.

Rules for the copy from now on (write them into the folder's README):

- An icon's name is never renamed or deleted; check-in trackers will store these
  names. Replacing an icon's drawing by hand is fine.
- No syncing with future Lucide versions. New icons may be added by hand.

Out of scope: the tracker icon picker, Lucide's category/search data (copied later
with the picker, from the same Lucide version 1.59.0), the open-source licenses page
(separate task), and the `mobile/frontend` and `desktop/frontend` checkouts.
