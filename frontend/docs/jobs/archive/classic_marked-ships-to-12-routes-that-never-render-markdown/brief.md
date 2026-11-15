# Brief: `marked` ships to 12 routes that never render markdown

type: feature
id: classic
branch: feature/classic_marked-ships-to-12-routes-that-never-render-markdown
date: 2026-11-10
author: Leander Muskalla

Source report: `docs/reports/2026-11-09-marked-via-formathelper.md`

route node through `.svelte-kit/output/client/.vite/manifest.json`. Sizes are the
`.br` files the build writes. Then I tried the fix below in a throwaway build to
check that it works, and reverted it. No code was changed.

**Overall: a small, safe performance win.** It is a one-file move, and the result
was checked against a real build.

---

## 1. Finding (verified)

`FormatHelper.ts:1` imports `marked` at the top of the module, because of
`markdownToHtml`. Only one component calls that function:
`todos/props/Description.svelte:165`. The other exports (`nl2br`, `truncate`,
`stripHtml`, `hasMeaningfulDescription`) are plain string/DOM helpers. Vite emits
the helper as a single chunk (`FormatHelper`, 276 B br) that statically imports
the `marked` chunk (**10.9 KB br, 38.9 KB min**). So any route that imports
*any* FormatHelper function also downloads and parses `marked`.

Routes that pull in `marked` today:

| Route | Pulled in through | Needs `marked`? |
|---|---|---|
| `/` (dashboard) | `QuoteWidget` → `nl2br` | no |
| `/clipboard` | `ClipboardList` → `truncate` | no |
| `/feeds` | `CardEntry`/`ComfortableEntry` → `stripHtml` | no |
| `/dev-requests/[[id]]` | `DevRequestEntry` → `nl2br` | no |
| `/libraries/{books,games,links,movies,music,plants,quotes,recipes}` | shared `Entries` chunk → quote/recipe `nl2br` | no |
| `/todos` (+ its layout) | `Description` → `markdownToHtml` | **yes** |
| `/notes/[id]`, `/notes/journal/[date]` | `TipTapEditor` imports `marked` itself | **yes** |

The dashboard is the first page most users see after login. It already loads
86 KB br on top of the root layout's 180 KB, and about 11 KB of that is `marked`,
which it never runs.

## 2. Suggested change

Move `markdownToHtml` into its own helper module, so that only the code that
renders markdown imports `marked`:

```ts
// src/lib/helpers/MarkdownHelper.ts
import { marked } from 'marked';

export function markdownToHtml(text: string): string {
	return marked.parse(text, { async: false });
}
```

- Delete the `marked` import and `markdownToHtml` from `FormatHelper.ts`.
- `Description.svelte:7`: import `markdownToHtml` from `$lib/helpers/MarkdownHelper`.
- `tests/unit/helpers/FormatHelper.test.ts`: move the `markdownToHtml` block into
  a new `MarkdownHelper.test.ts`.

This is a split along an existing seam. No new abstraction is added; `helpers/`
already has one file per concern (STANDARDS 15.8).

**Checked in a throwaway build:** with this change, `marked` is reachable only
from `/todos` (+ layout), `/notes/[id]` and `/notes/journal/[date]`. All 12
routes in the "no" rows above drop it.

## 3. Expected effect

- About 11 KB br (≈ 39 KB of minified JS to parse) less on the dashboard and 11
  other routes, both on the first visit and on client-side navigation to them.
- No behaviour change. The output of `markdownToHtml` stays the same.

## 4. Same pattern, smaller: `canvas-confetti` (verified, optional)

`YourDay.svelte:18`, `TodoEditModal.svelte:21` and `routes/todos/+page.svelte:9`
import `canvas-confetti` statically (**5.1 KB br**), but it only runs when a todo
is completed. A lazy `const { default: confetti } = await import('canvas-confetti')`
at the three call sites would take it off the dashboard's and `/todos`'
critical path. The first celebration would wait about one round-trip for the
chunk. The SW precache hides that delay for installed PWAs. Worth doing in the
same job only if the owner is fine with that delay.

## 5. How to verify

`npm run build`, then check that the `FormatHelper` chunk in
`build/client/_app/immutable/chunks/` no longer has `import … from "./<marked>.js"`.
In the Vite manifest, `marked.esm` should only be reachable from the todos and
notes nodes. `npm test` and `npm run check` should stay green.
