# Implementation: Month/Day/Year

id: most
developer: developer
date: 2026-10-29

## Summary

Added the month/day/year date formats `mm/dd/YYYY` (10/25/2026) and `mm/dd/YY` (10/25/26) to the settings page and the onboarding step. Also fixed `formatMonth`, which didn't remove a day token that sits between two separators. No new UI strings were needed (the labels are example dates).

## Changes

TASK-1: `src/lib/helpers/DateHelper.ts`: `formatMonth`'s regex has a third case, `(?<=[^a-zA-Z])dd[^a-zA-Z]`. It removes a day token that sits between separators, so `mm/dd/YYYY` becomes `mm/YYYY`. Leading and trailing day handling is unchanged.
TASK-2: `tests/unit/helpers/DateHelper.test.ts`: new assertions for `formatDate`, `formatDateWithoutYear` and `formatMonth` with `mm/dd/YYYY` and `mm/dd/YY`.
TASK-3: `src/lib/components/settings/LocalizationSettings.svelte`: two new `dateFormatOptions` entries (`10/01/2025`, `10/01/25`).
TASK-4: `src/lib/components/dashboard/onboarding-modal/OnboardingModalStepLocalization.svelte`: two new `dateFormats` entries (`mm/dd/YYYY (12/31/2025)`, `mm/dd/YY (12/31/25)`).

## Known issues / follow-ups

- `node_modules` is not installed in this worktree, so `npm test`, `npm run check` and `npm run lint` could not run, and I did not install packages. I checked the new regex and the without-year output with plain `node` against all existing and new formats, and the results match the test expectations. Please run `npm test` before merging.
- Backend: if the API checks `date_format` against an allow-list (`PUT /users/me/settings/date-format`), it has to accept `mm/dd/YYYY` and `mm/dd/YY`. Otherwise the new options won't save.
- Open question from tasks.md: should the onboarding default for `en-US` browsers (`getDefaultDateFormat`) switch to `mm/dd/YYYY`? Not done here.
