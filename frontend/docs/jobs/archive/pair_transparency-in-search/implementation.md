## Summary

Restored the frosted-glass (tinted + blurred) surface on the two "expandable
overlay search input" components — the library search (shared across all 8
library routes) and the contacts search — so they match the reference
treatment used by `UiNotifications`. Verification uncovered that the
Tailwind class change alone was not enough: a pre-existing global CSS rule
was silently forcing the inputs back to opaque, so the fix required a small
addition (`!important`) beyond the originally-scoped plain class swap.

## Changes

TASK-1: Restyled `src/lib/components/libraries/shared/Search.svelte` — replaced
`bg-transparent ... backdrop-blur-xs` with the same tinted/blurred treatment
as `UiNotifications` (`bg-c-neutral/60 ... backdrop-blur-sm ... dark:bg-s-dark/80`).

TASK-2: Restyled `src/lib/components/contacts/Search.svelte` — replaced the
fully opaque `bg-c-bg-surface` (no blur) with the same `bg-c-neutral/60 ...
backdrop-blur-sm ... dark:bg-s-dark/80` treatment.

TASK-3: Visual verification (light + dark, over varied backgrounds) via a
temporary preview route + `shot`/Playwright, screenshots committed under
`screenshots/`. This verification found that the TASK-1/TASK-2 class changes
rendered as fully opaque in the browser despite being correct Tailwind
classes. Root cause: `src/styles/components/forms.css` sets an *unlayered*
`background-color` on all non-checkbox/radio/file inputs (added previously
to theme `@tailwindcss/forms`'s white default across the app). Per CSS
Cascade Layers, an unlayered rule always wins over a `@layer`'d rule
(Tailwind utilities live in a named `utilities` layer) regardless of source
order or specificity — so the background utility was being silently
overridden only on `<input>` elements (confirmed with `div` vs `input`
comparison and Chrome DevTools' `CSS.getMatchedStylesForNode`). Fixed by
marking just the background utilities on these two inputs `!important`
(`!bg-c-neutral/60 ... dark:!bg-s-dark/80`), which is enough to beat the
global rule without touching `forms.css` (used by every other input in the
app, out of scope to change). Re-verified after the fix: both inputs now show
the backdrop blur correctly bleeding/tinting over a colorful gradient and a
striped background, in both light and dark mode, with typed text remaining
legible in light mode.

## Known issues / follow-ups

- While verifying dark mode, both search inputs (and, for comparison, the
  reference `UiNotifications` component itself) render body text in a dark
  color with no explicit `dark:text-*` class, giving low contrast against
  the darkened translucent surface. This is a pre-existing, app-wide
  characteristic (confirmed identical on the reference component), not
  something introduced or worsened by this fix, and out of scope for a
  "restore transparency/blur" task — flagging it here in case it's worth a
  separate follow-up.
- As noted by the analyst, the two Search.svelte files remain near-duplicate
  implementations; not consolidated here per "don't refactor unrelated code".
- A temporary preview route and `npm ci`-restored `node_modules` were used
  for verification only; the preview route was removed and is not part of
  this branch's history (node_modules stays gitignored as before).
