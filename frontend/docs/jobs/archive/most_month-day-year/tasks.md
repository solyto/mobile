# Tasks: Month/Day/Year

id: most
analyst: analyst
date: 2026-10-29

Produced by @analyst from brief.md. Branch verified: `feature/most_month-day-year`.

## Findings (read before implementing)

- Date formats are plain token strings (`dd`, `mm`, `YYYY`, `YY`) stored in
  `user.settings.date_format` (typed `string` in `src/lib/types/auth.ts`). There
  is **no** central config or union type for the allowed formats. The option
  list is duplicated in two places:
  - `src/lib/components/settings/LocalizationSettings.svelte` (`dateFormatOptions`, settings page select)
  - `src/lib/components/dashboard/onboarding-modal/OnboardingModalStepLocalization.svelte` (`dateFormats`, onboarding buttons)
  The brief mentions "config/types", but there is nothing there to update.
  Introducing a shared config/union type would be a new abstraction. Per the
  hard rules, this job does **not** add one; it adds the new options in both
  existing lists.
- The new values are `mm/dd/YYYY` (renders `10/25/2026`) and `mm/dd/YY`
  (renders `10/25/26`), using the same token syntax as the existing formats.
- Rendering (`Auth.inUserPreferredFormat*` → `src/lib/helpers/DateHelper.ts`):
  - `formatDate`: works as is for `mm/dd/YYYY` and `mm/dd/YY`; needs tests only.
  - `formatDateWithoutYear`: works as is (`10/25/` → trailing slash stripped → `10/25`); needs tests only.
  - `formatMonth`: **broken for the new formats**. Its regex
    `/^dd[^a-zA-Z]|[^a-zA-Z]dd$/` only strips a leading or trailing day. With
    `dd` in the middle it strips nothing, so month labels in finance charts
    (`WealthStatisticsService.getMonthLabels`) would show `10/01/2026` instead
    of `10/2026`.
- Backend risk: the date format is saved through
  `PUT /users/me/settings/date-format` (`Auth.updateDateFormat`). The API lives
  in a separate repo. If it checks the value against an allow-list, it will
  reject `mm/dd/YYYY` / `mm/dd/YY`. This repo can't confirm either way, so the
  task list doesn't depend on it, but the owner should check it before
  release (see Open questions).
- No new UI strings: option labels are literal example dates, so no i18n work.

## Task breakdown

TASK-1: Fix `formatMonth` so that a day token between separators (e.g. `mm/dd/YYYY` → `mm/YYYY`) is removed, keeping the behaviour for leading/trailing day unchanged.
  files: src/lib/helpers/DateHelper.ts
  depends: none
  risk: low — small regex change in a pure, unit-tested helper. Existing formatMonth tests catch regressions.

TASK-2: Add unit tests for the new formats: `formatDate` (`mm/dd/YYYY` → `08/15/2025`, `mm/dd/YY` → `08/15/25`), `formatDateWithoutYear` (→ `08/15`), and `formatMonth` (→ `08/2025`, `08/25`).
  files: tests/unit/helpers/DateHelper.test.ts
  depends: TASK-1
  risk: low — test-only change following the existing `AUG_15` fixture pattern.

TASK-3: Add `{ value: 'mm/dd/YYYY', label: '10/01/2025' }` and `{ value: 'mm/dd/YY', label: '10/01/25' }` to `dateFormatOptions` on the settings page, using the same example date as the existing labels.
  files: src/lib/components/settings/LocalizationSettings.svelte
  depends: none
  risk: low — data-only addition to an existing options array. Saving will only persist if the backend accepts the value (see Open questions).

TASK-4: Add `mm/dd/YYYY (12/31/2025)` and `mm/dd/YY (12/31/25)` entries to `dateFormats` in the onboarding localization step, matching the existing label style.
  files: src/lib/components/dashboard/onboarding-modal/OnboardingModalStepLocalization.svelte
  depends: none
  risk: low — data-only addition. The grid is `grid-cols-2`, so 8 entries still lay out evenly.

## Open questions (not blocking, for the owner)

1. Does the backend validate `date_format` against a fixed list? If it does, it needs a matching change in the API repo before this ships. Otherwise the new options will fail to save.
2. Should the onboarding default for `en-US` browsers (`OnboardingModal.svelte` `getDefaultDateFormat`, which currently returns `YYYY-mm-dd`) change to `mm/dd/YYYY`? The brief doesn't ask for it, so it is **not** included above. Add it as a separate task only if the owner confirms.
