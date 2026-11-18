# Brief: format ru.ts with one key per line

type: feature
id: sort
branch: feature/sort_format-ru-ts-with-one-key-per-line
date: 2026-11-17
author: Leander Muskalla

updated: 2026-11-17 (rules decided by the owner, ready for implementation)

## Job (decided, do exactly this)

Reformat `src/lib/i18n/ru.ts` like the other locale files. **Formatting only:**
no key, value, order or comment changes. Its own commit with nothing else in
it.

Rules:
1. **One entry per line, at every nesting level**, like `en.ts`. This covers
   top-level keys (e.g. the budget, wealth range and tag keys around
   `ru.ts:683-689`) and entries inside nested objects (e.g. `weekdays`,
   `weekdays_short` `:746`, `recurrence_ordinals` `:757`,
   `recurrence_weekdays`). Compare with `en.ts`, e.g. `weekdays_short`
   (`en.ts:961`) and `recurrence_ordinals` (`en.ts:994`), which put each
   number on its own line.
2. **Exception, keep grouped:** lines that hold the same group of keys on one
   line in `en.ts` stay grouped in `ru.ts` too. Today these are 19 lines, the
   same in en/de/es/fr/it, e.g. the check-in scales `mood_1 … mood_5`,
   `sleep_1 … sleep_5`, and `day_today, day_yesterday`. Derive the list from
   `en.ts`, don't hard-code it.
3. **`recurrence_ordinals_by_weekday`** (`ru.ts:763-769`) exists only in ru
   (Russian ordinals change by weekday). Keep the key and all values; format it
   by rule 1 too (each weekday's inner entries one per line).
4. Indentation, quotes and trailing commas follow the style already used in
   `en.ts` (tabs, single quotes, escaped quotes kept as they are).

How (suggested): a one-off script, not committed, that parses the sections and
rewrites them. It must handle commas, quotes and escaped quotes inside values.

## Verification (required)

- Import the old and the new `ru.ts` (e.g. with a small Node/tsx script) and
  check that the exported objects are deeply equal: same keys, same values,
  same nesting. Any difference means the job failed.
- `npm run check` passes (it also checks that all locales have the same keys).
- `npm run lint` (eslint) and `npm test` pass.

## Out of scope (do not do)

- Any translation change, also where a Russian text looks wrong.
- Changes to other locale files.
- Adding formatter configs (there is no Prettier config in this repo).

## Background (for context, no action)

`ru.ts` was added in `9793446` in a compressed style: 233 lines with several
keys per line, against 19 deliberate groups in each other locale. Later changes
followed that style in ru only. Mixed formatting makes diffs across locales
hard to compare. Raised by the owner on 2026-11-17.
