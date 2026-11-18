# Tasks: format ru.ts with one key per line

id: sort
analyst: analyst
date: 2026-11-17

## Findings (from reading the files)

- `src/lib/i18n/ru.ts` has 242 lines with several `key: value` pairs on one line,
  in many sections: top-level keys (e.g. `finances` `:675-688`, `feeds`
  `:692-722`, `calendar` `:747-782`) and nested objects (`months` `:739-740`,
  `weekdays` `:743-744`, `weekdays_short` `:746`, `recurrence_ordinals` `:757`,
  `recurrence_weekdays` `:759-760`, `recurrence_ordinals_by_weekday` `:763-769`).
- `en.ts` has exactly 19 grouped lines, all in `checkInSummary` (`en.ts:414-432`,
  `mood_*` … `section_*`). `ru.ts:413-431` has the same 19 groups in the same
  order. Rule 2 says to derive the group list from `en.ts`: a ru line stays
  grouped only if its key list matches an en grouped line exactly.
- `ru.ts` has no double quotes, backticks or escaped `\'`, so every value is a
  plain single-quoted string. The parser still has to handle `,` and `:` inside
  values, e.g. `'Импорт лент... {n} из {total}'` and URLs like
  `'https://cloud.example.com.'` (`:828`, `:1132`).
- The style to match (`en.ts`, `docs/STANDARDS.md` §1): tab indent, single
  quotes, no trailing comma after the last entry, nested objects opened
  as `key: {` with each entry on its own line and closed with `},`/`}` on its
  own line.
- I could not run `git branch --show-current` because I'm read-only with no
  shell. `/workspace/.git` points to worktree
  `sort_format-ru-ts-with-one-key-per-line`, which matches the job. The
  developer should confirm the branch is
  `feature/sort_format-ru-ts-with-one-key-per-line` before committing.

## Task breakdown

TASK-1: Write a one-off, uncommitted script (outside the repo tree or in a
  gitignored/temp path) that splits every multi-entry line in `ru.ts` into one
  entry per line at its current indent. It also expands inline nested objects
  (`weekdays_short`, `recurrence_ordinals`, each inner object of
  `recurrence_ordinals_by_weekday`) into multi-line blocks. Lines whose key
  set equals a grouped line in `en.ts` stay untouched.
  files: none committed (temp script only); reads `src/lib/i18n/ru.ts`, `src/lib/i18n/en.ts`
  depends: none
  risk: medium — naive splitting on `, ` would break values that contain
  commas or colons, so the script must tokenize single-quoted strings.

TASK-2: Run the script to rewrite `src/lib/i18n/ru.ts`, and keep a copy of the
  original (e.g. `git show HEAD:src/lib/i18n/ru.ts` into a temp file) for
  verification.
  files: src/lib/i18n/ru.ts
  depends: TASK-1
  risk: low — formatting-only rewrite of one file.

TASK-3: Verify equivalence. Import the old and new `ru.ts` with a small
  temporary Node/tsx or Vitest script and assert the exported `ru` objects are
  deeply equal. Also confirm:
  (a) the only lines with more than one entry are the 19 en-derived groups;
  (b) no trailing commas after last entries;
  (c) no space-indented lines;
  (d) no blank lines were added or removed;
  (e) `git diff --stat` touches only `ru.ts`.
  Do not commit the verification script.
  files: none committed
  depends: TASK-2
  risk: low — a read-only check; any difference means going back to TASK-1.

TASK-4: Run `npm run check`, `npm run lint` and `npm test`, then commit
  `ru.ts` alone in its own commit (e.g. "Format ru.ts one key per line").
  files: src/lib/i18n/ru.ts
  depends: TASK-3
  risk: low — no behavior change; the commit must hold nothing but `ru.ts`.

## Open points

- None blocking. Out of scope: translation fixes, other locale files, and
  formatter configs (see brief).
