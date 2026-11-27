# Tasks: switch the app to our own copy of the Lucide icons

id: peace
analyst: analyst
date: 2026-11-19

## Findings that shape the plan

Checked against `@lucide/svelte@1.59.0` on unpkg. `node_modules` is not
installed in this worktree, so run `npm ci` from the existing lock file first.
`npm ci` installs what the lock file pins and adds nothing new.

1. **Import paths resolve to `.js` files, not `.svelte` files.** The package
   export map is `"./icons/*" → ./dist/icons/*.js`. Each `<name>.js` file only
   does `export { default } from "./<canonical>.svelte"`. For most icons the two
   names match (`book.js` → `book.svelte`).
2. **Some names the app imports are Lucide aliases.** Example:
   `@lucide/svelte/icons/music` resolves to `music.js` →
   `eighth-notes.svelte`, and no `music.svelte` exists. The icon's data lists
   `"aliases": ["music"]`. The brief's fact 2 ("each icon in
   `dist/icons/<name>.svelte`") and its count of 1,891 icons only cover the
   canonical `.svelte` files. This affects TASK-1 and TASK-3; see the open
   question below.
3. **Icon files are TypeScript.** Each icon is
   `<script lang="ts">import Icon from '../Icon.svelte'; let props = $props(); const iconData = {name, size, node, aliases};</script>`
   followed by `<Icon {...props} icon={iconData} />`. Each file has an ISC
   license header comment and an `@component` doc comment that holds the base64
   `@preview`.
4. **`Icon.svelte` dependencies.** It imports `./context.js`
   (`getLucideContext`), `./utils/buildLucideIconNode.js`,
   `./utils/hasA11yProp.js` and `./utils/mergeClasses.js`.
   `utils/defaultAttributes.js` also exists, and the types live in the package's
   `.d.ts` files. TASK-1 must copy all of these, as `.ts` where the package
   ships `.js` + `.d.ts`, so that `svelte-check` (strict mode) keeps the
   `class`/`size`/`fill` prop types.
5. **Lint applies to the copy.** `eslint .` lints everything under `src/`, and
   only `docs/**` and `.claude/**` are ignored. The rules include
   `semi: always`, `comma-dangle: never` and `no-explicit-any`. The generated
   files must pass these rules; do not exclude the folder from lint.
6. **There is one non-Svelte importer:** `src/lib/state/LibraryNavigation.svelte.ts`
   (8 imports, typed as `Component`). All 459 imports in 165 files use the form
   `from '@lucide/svelte/icons/<name>'`. There is no `@lucide/svelte`
   reference in `tests/`, `vite.config.ts`, `svelte.config.js`,
   `eslint.config.js` or `tsconfig.json`. Only `package.json` and
   `package-lock.json` mention it.

## Open question (decide before TASK-1/TASK-3)

**What should we do with alias names such as `music`?** The default below fits
the brief's "same file names as in the package" and "1,891 icons":

- **Default (A):** copy only the canonical `.svelte` files. In TASK-3, rewrite
  each import to the canonical file its `.js` resolves to, e.g.
  `import IconMusic from '$lib/icons/lucide/eighth-notes.svelte'`. The import
  variable name stays the same, so this is still only a path change. Drop the
  `aliases` field from `iconData`, so the copy doesn't list names it doesn't
  have.
- **Alternative (B):** also create one file per alias name. This would make
  alias names permanent names too (more files, and duplicate names for the
  later picker).

If the owner wants (B), only TASK-1's generator and TASK-3's mapping change.

## Task breakdown

TASK-1: Use a one-off script (not committed) to generate
`src/lib/icons/lucide/` from `node_modules/@lucide/svelte/dist`:
- One `<canonical-name>.svelte` per icon.
- Keep the license header comment and `iconData` with `name`, `size` and
  `node` as plain data.
- Drop the `@component`/`@preview` comment and, per default (A), the
  `aliases` field.
- Point the import at `./Icon.svelte`. Note that the folder is flat.
- Copy `Icon.svelte`, `context`, `utils/*` and the types it needs, with logic
  unchanged and only import paths adjusted.
- Format the output to pass `eslint` (semicolons, no trailing commas).

files: `src/lib/icons/lucide/*.svelte` (~1,891), `src/lib/icons/lucide/Icon.svelte`, `src/lib/icons/lucide/context.ts`, `src/lib/icons/lucide/utils/*.ts`, `src/lib/icons/lucide/types.ts` (exact helper file names follow the package)
depends: none (needs `npm ci` and the open-question decision)
risk: medium — porting the shipped `.js`/`.d.ts` helpers to typed `.ts` and getting ~1,900 generated files clean under strict `svelte-check` and `eslint` is where errors will surface.

TASK-2: Add the license and README to the folder:
- Copy `node_modules/@lucide/svelte/LICENSE` unchanged to
  `src/lib/icons/lucide/LICENSE`.
- Write a short `src/lib/icons/lucide/README.md` that says:
  - the copy comes from `@lucide/svelte` 1.59.0;
  - icon names are never renamed or deleted, because check-in trackers store
    them;
  - an icon's drawing may be replaced by hand;
  - no syncing with future Lucide versions;
  - new icons may be added by hand.

files: `src/lib/icons/lucide/LICENSE`, `src/lib/icons/lucide/README.md`
depends: TASK-1
risk: low — copied text plus a few lines.

TASK-3: Run a one-off script (not committed) that rewrites every
`'@lucide/svelte/icons/<name>'` import in `src/` to
`'$lib/icons/lucide/<canonical>.svelte'`. Get `<canonical>` from the target of
the package's `<name>.js`, so aliases like `music` → `eighth-notes` are
handled. Change nothing else in those files: the import variable names stay
as they are.
files: 165 files under `src/routes/` and `src/lib/components/`, plus `src/lib/state/LibraryNavigation.svelte.ts`
depends: TASK-1
risk: medium — 459 edits; an alias missed or mapped wrong breaks the build, and an icon mapped to the wrong drawing would build fine and only show up on screen.

TASK-4: Remove `@lucide/svelte` from `package.json` and update
`package-lock.json` with `npm uninstall @lucide/svelte`. Nothing is installed.
Confirm that `grep -r "@lucide/svelte" src tests *.json *.js *.ts` has no
matches.
files: `package.json`, `package-lock.json`
depends: TASK-3
risk: low — removing a dependency once nothing imports it.

TASK-5: Verify the change:
- Run `npm run check`, `npm run lint`, `npm test` and `npm run build`.
- Compare the client bundle size in `build/client` (or `.svelte-kit/output/client`)
  with a build of the parent commit. It should not be noticeably larger, and
  only used icons should be bundled.
- For a sample of icons (including `music`/`eighth-notes` and one icon that
  uses `fill`), compare the old and new rendered `<svg>` markup
  (attributes, classes, `size`).
- Spot-check a few screens (navbar, libraries nav, check-in, todos).

files: none (record results in `implementation.md`)
depends: TASK-2, TASK-4
risk: medium — `svelte-check`/`eslint` run time over ~1,900 extra files may grow noticeably; report it if it does.

## Out of scope

The tracker icon picker, Lucide category/search data, the open-source licenses
page, `mobile/frontend` and `desktop/frontend`, and the custom icons in
`src/lib/components/ui/icons/` (they stay unchanged).
