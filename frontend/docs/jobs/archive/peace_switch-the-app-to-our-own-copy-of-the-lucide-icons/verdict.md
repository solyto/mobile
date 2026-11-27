# Verdict: switch the app to our own copy of the Lucide icons

id: peace
reviewer: reviewer
date: 2026-11-19

## Review

TASK-1: PASS
notes: `src/lib/icons/lucide/` holds 1,891 icon files plus `Icon.svelte`, `context.ts`, `types.ts` and `utils/*.ts`. Each icon keeps its `iconData` as plain data, has no `@preview`, and imports `./Icon.svelte`. The helpers are typed `.ts` ports with the same logic, and `SVGProps` uses `Record<string, unknown>` instead of `any`. The `aliases` field differs from the plan, but the developer kept it on purpose: Lucide renders it as the `lucide-<alias>` class, and brief point 5 asks for identical output. That reason holds. The `$derived` calls in `Icon.svelte` are needed, because props such as `class` change while the component is alive (STANDARDS 3.1). The license headers are a license requirement, so STANDARDS 10.1 allows them.

TASK-2: PASS
notes: The `LICENSE` file is the ISC license plus the Feather MIT section. `README.md` names the source version, 1.59.0, and states all four rules from the brief.

TASK-3: PASS
notes: I checked the diff outside the copy and the `app.css` change. It removes 459 import lines and adds 459, and nothing else changes. Every variable name stays the same. Of these imports, 12 were alias paths, and each now points to a canonical file whose `aliases` contain the old name. Examples: `music` → `eighth-notes`, `trash-2` → `trash`, `fingerprint` → `fingerprint-pattern`.

TASK-4: PASS
notes: `@lucide/svelte` is gone from `package.json` and `package-lock.json`. Outside the copy's license headers, `src`, `tests` and the config files no longer mention it.

TASK-5: PASS
notes: I re-ran the checks myself:
- `npm test`: 1,732 tests pass.
- `npm run check`: 3,157 files, 0 errors and 0 warnings, with `--max-old-space-size=1900`.
- `eslint`: clean on all changed files, `Icon.svelte`, the `.ts` helpers and a sample of icon files. I did not run the full 10–14 minute lint.

The developer's numbers for bundle size and markup identity are plausible and well documented. The contrast findings in the render report are on `/auth/login` and do not come from this change.

The diff also adds `@source not './lib/icons/lucide'` to `src/app.css`. This is outside `tasks.md`, but it is justified and documented: brief point 6 says the bundle must not grow, and without the line the icon names would generate about 6 KB of unused Tailwind CSS. Its comment explains why the line is there, which STANDARDS 10.1 allows.

## Security

Not run.

## Overall

APPROVED

No blockers. Notes for the owner (not blockers): lint now takes about 10–14 minutes and `npm run check` needs more heap. The developer listed whether to add the copy to the ESLint ignores as an owner decision in `implementation.md`.
