# Implementation: switch the app to our own copy of the Lucide icons

id: peace
developer: developer
date: 2026-11-19

## Summary

The full Lucide icon set from `@lucide/svelte` 1.59.0 (1,891 icons) is now in
`src/lib/icons/lucide/`. Every icon import in the app points there, and
`@lucide/svelte` is removed. Rendered output is unchanged, and so are the
client JS and CSS bundles.

Open question decided: **default (A)**. Only the canonical icon files were
copied. The 12 alias imports point to their canonical file (`music` →
`eighth-notes.svelte`, `trash-2` → `trash.svelte`, `check-circle` →
`circle-check-big`, …) and keep their import variable names.

One difference from the analyst's plan: the `aliases` field stays in
`iconData`. Lucide renders each alias as an extra class (`lucide-music`), so
dropping it would change the rendered markup, and brief point 5 asks for
identical output. It only affects that class. To drop it later, remove the
field from the 257 icon files that have it.

## Changes

TASK-1: `src/lib/icons/lucide/` was generated with a one-off script (not
committed):
- 1,891 `<name>.svelte` files. Each one has the upstream license header, a
  typed `props: LucideProps`, and `iconData: LucideIconData` written as plain
  data (`name`, `size`, `node`, plus `aliases` where present). The
  `@component`/`@preview` comments are gone.
- `Icon.svelte`, `context.ts`, `types.ts` and `utils/*.ts` are typed `.ts`
  ports of the package's `.js` + `.d.ts`, with the same logic. Removed: the
  JSDoc and `@deprecated`/`@TODO` comments (STANDARDS 10.1), and the unused
  `IconNode`, `IconEvents` and `IconSlots` types. `SVGProps` is
  `Record<string, unknown>` instead of `any`. The `{#each}` in `Icon.svelte`
  got an index key to satisfy lint; the DOM output is the same.

TASK-2: Added Lucide's `LICENSE` unchanged and a `README.md` that gives the
source version (1.59.0) and the rules: no renames or deletions, drawings may
be replaced by hand, no syncing with future Lucide versions, new icons may be
added by hand.

TASK-3: A one-off script rewrote all 459 imports in 165 files to
`$lib/icons/lucide/<canonical>.svelte`. It resolved aliases through the
package's `<name>.js` re-exports. The diff contains import-path lines only.

TASK-4: Ran `npm uninstall @lucide/svelte`, which changed only
`package.json` and `package-lock.json`. Outside the copy's own license
headers, nothing in `src`, `tests` or the config files mentions
`@lucide/svelte` anymore.

TASK-5 (verification) and one fix it needed:
- **Fix in `src/app.css`:** added `@source not './lib/icons/lucide'`. Tailwind
  v4 scans all source files, so icon names such as `columns-2`, `text-wrap`,
  `scale-3d` and `form-input` became about 6 KB of unused CSS. With the
  exclusion, the CSS output is identical to the parent commit.
- `npm test`: 100 files, 1,732 tests pass.
- `npm run check`: 0 errors, 0 warnings.
- `npm run lint`: passes.
- Bundle, compared against a build of the parent commit `d34cbea`: client JS
  went from 3,111,228 to 3,110,527 bytes (−701 B), with the same 274 JS
  files. CSS is identical. Only the used icons are bundled.
- Rendered markup: a throwaway component test rendered old and new side by
  side. It covered all 180 icon paths the app imports, including the 12
  aliases, each with 6 prop sets (`{}`, `class`, `size` as number and
  string, `fill` + `class`, `aria-label` + `strokeWidth`). All 1,080 outputs
  were identical. A script also confirmed that all 1,891 icons carry exactly
  the package's `iconData`.
- Browser: `/auth/login` renders the eye icon and the passkey fingerprint
  icon (the alias `fingerprint` → `fingerprint-pattern`). Screenshot is in
  `screenshots/`. No API was available, so logged-in screens (navbar,
  libraries, check-in, todos) could not be checked in the browser. They are
  covered by the markup comparison above.

## Known issues / follow-ups

- **Lint got much slower.** `npm run lint` took 1m49s before and about 10–14
  min now. The type-aware ESLint parsing of 1,891 extra `.svelte` files
  causes it. Following the analyst's plan, the folder is not excluded from
  lint. Adding `src/lib/icons/lucide/**` to the ESLint ignores would bring
  the time back to the baseline, but that is the owner's call.
- **`npm run check` needs more memory and time:** 58–85 s instead of 25 s,
  and above 1.1 GB of heap. In this 2 GB container, it only passes with
  `NODE_OPTIONS=--max-old-space-size=1900`. On a normal dev machine, Node's
  default heap should be enough.
- **`npm run build` gets killed here** (2 GB container cap) in the final
  adapter-node step. The parent-commit build was killed the same way, so this
  is the container, not this change. The vite client and server builds
  complete, and the bundle numbers above come from those.
