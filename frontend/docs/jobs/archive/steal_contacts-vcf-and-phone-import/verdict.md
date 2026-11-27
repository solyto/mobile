# Verdict: contacts-vcf-and-phone-import

id: steal
reviewer: carmine
date: 2026-11-24

Reviewed: `git diff main...HEAD` at `0b8f2b7`, against `tasks.md`, `implementation.md`,
`docs/STANDARDS.md`, the policies, the contract (`01M8776XF7`, `01M8778FWB`) and the
calendar import it mirrors (`956fae7`).
Checks run here: eslint on the changed files (clean), vitest for the four affected test files
(68/68). `npm run check` runs out of memory in this session (2 GB cap); I rely on tony's run
(0 errors / 0 warnings at `0b8f2b7`). I compared the translations by keys only (eugene).

## Review

TASK-1: PASS
notes: `docs/backlog/` is a per-session tmpfs mount (verified with `mount`), so tony's two
entries (`contacts-phone-import.md`, `contacts-open-vcf-with-solyto.md`, written 16:47) can't be
seen from this session. I reviewed their content from the room copies
(`tony/contacts-phone-import.md`, `tony/contacts-open-vcf-with-solyto.md`): goal, current state
and origin are documented, and they match the brief's out-of-scope items. Whether they reached
the project backlog is outside this branch; tony asked the human to confirm.

TASK-2: PASS
notes: The types match the contract (`source`, `contacts_skipped`, stage `failed`, nullable
`address_books`). `startFileImport` is in `apiRoutes`. `ContactImportService` is pure,
unit-tested, and builds the multipart request per contract (`address_book_id` excludes `name`/`color`;
`color` is always sent for a new book, defaulting to `#0088CC`). The status mapping per source
matches the contract (CardDAV: only 409/429 are specific).

TASK-3: PASS
notes: `state/ContactImport.svelte.ts` matches `CalendarImport.svelte.ts` apart from the domain
fields. It has a `destroy()`, called from `routes/contacts/+layout.svelte` `onDestroy` (STANDARDS 11.4).
Polling stops on select/finished/failed and after the stall timeout, and keeps going through
network/rate-limit errors. The `Contacts` store no longer has any import members. The one comment
(`post()`) documents an API contract (STANDARDS 10.1, allowed). Store tests use fake timers and
cover the stop conditions, resume on open, and close semantics.

TASK-4: PASS
notes: `ImportModal.svelte` is now a shell around `CarddavForm` / `CarddavSelect` / `FileForm`,
like the calendar modal. Saves go through `SaveAction.runIfIdle` (STANDARDS 15.7). The leaf forms
receive data via props and read only `ts` (3.3), use shared `forms/`/`ui/` components (7), and
have no `$derived`/`$effect`. The colour picker copy is allowed by the human and tracked in
`shared-color-picker-component.md`. Design review fix applied (`0b8f2b7`). The progress label is
safe because the API sets `address_books_current` for file imports (ralphie, via tony). All six
locales have the 11 new keys plus the two reworded ones (`d66ba42`).

## Security

None found. The CardDAV secret is only sent in the request body; nothing is logged.

## Overall

APPROVED

No blockers. My earlier NEEDS WORK (`8a9a7b0`) came from the per-session backlog mount, not from
missing work. At `0b8f2b7` tony reports svelte-check 0 errors / 0 warnings, vitest 2526/2526 and eslint clean.
