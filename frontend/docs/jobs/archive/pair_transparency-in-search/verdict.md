# Verdict: transparency in search

id: pair
status: reviewed
reviewer: reviewer
date: 2026-08-31

## Review

TASK-1: PASS
notes: `src/lib/components/libraries/shared/Search.svelte` input now uses
`!bg-c-neutral/60 ... backdrop-blur-sm ... dark:!bg-s-dark/80`, matching the
`UiNotifications` reference tint/blur values exactly (only difference is the
`!important` markers, justified below). Confirmed via diff and screenshots
that the frosted-glass effect renders correctly over varied backgrounds in
both light and dark mode.

TASK-2: PASS
notes: `src/lib/components/contacts/Search.svelte` input restyled identically
(`bg-c-bg-surface` → `!bg-c-neutral/60 ... backdrop-blur-sm ...
dark:!bg-s-dark/80`). Same verification as TASK-1 applies.

TASK-3: PASS
notes: Render report + screenshots (`screenshots/*.png`,
`render-report.md/json`) show both inputs rendering with visible
tint+blur over a gradient and a striped background, light and dark. The
`!important` addition beyond the plain class-swap originally scoped is
correctly justified: verified `src/styles/components/forms.css` imports an
unlayered `background-color` rule on `input:not(...)` via `src/app.css`
(not wrapped in `@layer`), which per CSS Cascade Layers semantics beats any
Tailwind utility (Tailwind utilities live in the `utilities` layer) regardless
of source order/specificity — so without `!important` the Tailwind bg utility
would have been silently overridden, exactly as reported. The `!bg-`/`dark:!`
pattern is not novel to this codebase (already used in
`calendars/NavigationEntry.svelte`, `calendars/views/month/Day.svelte`), so
this isn't an unfamiliar abstraction. Confirmed the temporary preview route
used for verification was not committed (only its screenshots remain under
`screenshots/`), and `node_modules` stays gitignored — matches
`implementation.md`'s claim.

Additional checks performed:
- `git diff main...HEAD` confirms only the two intended `Search.svelte`
  files were touched under `src/`; no unrelated refactors, no route changes
  landed on the branch.
- No new UI strings were introduced, so the i18n-sync hard rule doesn't
  apply here.
- `npx prettier --check` on both changed files passes.
- The "known issue" flagged in `implementation.md` (dark-mode body text has
  no explicit `dark:text-*` and is low-contrast against the darkened
  translucent surface) was independently verified against the
  `UiNotifications` reference itself (`notification-dark-check.png`), which
  has the identical characteristic (plain `<p>{message}</p>`, no
  `dark:text-*`). This is pre-existing and out of scope for a "restore
  transparency/blur to match the reference" task — correctly not fixed here,
  and correctly not silently ignored either (flagged for a possible
  follow-up).

## Security

None — pure Tailwind class changes on two existing `<input>` elements, no
new data flow, no new dependencies.

## Overall

APPROVED

No blockers. Both tasks match the reference styling exactly, the one
deviation from the original plain-class-swap plan (`!important`) is properly
diagnosed, minimally scoped (touches only the two inputs in question, not
`forms.css` which is used app-wide), and consistent with existing
`!`-prefixed utility usage elsewhere in the codebase. Scope stayed within the
two files identified by the analyst; verification artifacts (screenshots,
render report) support the "renders as expected" claim in both themes.
