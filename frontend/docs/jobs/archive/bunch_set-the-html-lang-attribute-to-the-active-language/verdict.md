# Verdict: Set the html lang attribute to the active language

id: bunch
reviewer: reviewer agent
date: 2026-10-29

## Review

Diff vs `main` (excluding job docs): one line in `src/lib/state/Translation.svelte.ts`. Nothing outside the task scope changed; `src/app.html` is untouched, as the brief asks.

TASK-1: PASS
notes: `src/lib/state/Translation.svelte.ts:59`. `if (browser) document.documentElement.lang = this.locale;` comes after the `switch`, so the `default` → `en` fallback is applied too, and `browser` keeps it safe during SSR. `changeLanguage` is the only place that sets `locale` (no other `.locale =` assignments in `src/`), so the stored setting, the navigator fallback, settings and onboarding all go through it. When the resolved language is `en`, `loadLanguage` skips `changeLanguage`, and `app.html`'s default `lang="en"` is already correct for that case. There is no `$effect`/`$derived`, no new strings and no new abstraction. The braceless `if` follows the style already used in `loadLanguage`.

TASK-2: PARTIAL
notes: `npm run check` and the manual dev-tools check were not run because `node_modules` is not installed in this worktree. I could not run them either. Static review found no type risk: `document` is in the DOM lib and the `browser` import already existed. This gap comes from the environment and is not a code defect, so it does not block approval. The brief's manual check still needs to be done once by whoever has a working dev setup.

## Security

none: a DOM attribute is set from a fixed whitelist of locale values.

## Overall

APPROVED

No blocking changes required.
