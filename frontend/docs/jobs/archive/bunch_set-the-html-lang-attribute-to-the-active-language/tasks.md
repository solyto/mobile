# Tasks: Set the html lang attribute to the active language

Branch check: `/workspace/.git` points at the worktree `bunch_set-the-html-lang-attribute-to-the-active-language`, which matches this job. `git branch --show-current` could not be run (no shell in the architect session), so the developer should confirm it is `feature/bunch_set-the-html-lang-attribute-to-the-active-language`.

## TASK-1

Description: At the end of `Translation.changeLanguage`, set `document.documentElement.lang = this.locale`, guarded by the existing `browser` import.

Files likely affected:
- `src/lib/state/Translation.svelte.ts`

Dependencies: none

Risk: low. It is a one-line side effect in the single place that sets `locale`. All callers already go through it: `loadLanguage` (stored setting / navigator), `LocalizationSettings.svelte:61` and `OnboardingModalStepLocalization.svelte:44`.

Notes:
- Nothing in `src/` sets `ssr = false`, so `changeLanguage` might also run on the server. Without the `browser` guard, `document` access would throw there.
- Put the assignment after the `switch` and use `this.locale`, so the `default` fallback to `en` is reflected too.
- Leave `src/app.html` unchanged (`lang="en"` stays as the pre-boot default, per brief).
- No `$effect`/`$derived`, no new i18n strings, no new abstraction.
- No unit test: `tests/` covers pure helpers/services in a node env, and this is a DOM side effect inside a runes store (see `docs/TESTING.md`).

## TASK-2

Description: Verify with `npm run check`, then do the manual check from the brief: switch the language in settings, confirm `<html lang>` changes in dev tools, and confirm it is still correct after a reload.

Files likely affected: none

Dependencies: TASK-1

Risk: low. This is verification only.
