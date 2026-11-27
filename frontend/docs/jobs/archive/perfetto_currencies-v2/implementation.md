# Implementation: currencies-v2

id: perfetto
developer: ralphie
date: 2026-11-25

## Summary

Implemented TASK-1 … TASK-5 of `tasks.md` on `feature/perfetto_currencies-v2`. TASK-6 (verification) is partially done: `npm test` passed 170 files / 2572 tests; `npm run check` shows only the five missing `settings.currency` locale keys until phil's translation commit lands.

- **TASK-1 (`9cb18bf`)** — Added `src/lib/config/currency.ts` as the single source: `SUPPORTED_CURRENCIES` (`EUR, USD, GBP, CHF, CAD, AUD, RUB`), `Currency`, `DEFAULT_CURRENCY`, `isSupportedCurrency()`. Added `formatCurrency(amount, currency, language)` to `NumberHelper.ts`: unknown/missing currency → EUR, invalid language → `en`, never throws. Unit tests cover separators, symbols and fallbacks.
- **TASK-2 (`a394299`)** — `UserSettings.currency: Currency`; `apiRoutes.users.settings.updateCurrency` → `/users/me/settings/currency`; `Auth.updateCurrency()` mirrors `updateWeekStart` (PUT, then update the reactive `user.settings` + `save()`). Store tests cover success and rejection.
- **TASK-3 (`988a284`)** — Sixth row in `LocalizationSettings.svelte` with the 7 ISO codes as values and `code + symbol` labels (no translated currency names). Added `settings.currency` to `en.ts` and `SettingsRecords`; component test covers the default and saving.
- **TASK-4 (`94c3746`)** — `DoughnutChart` no longer defaults to `europeanFormat`; it defaults to a neutral `String` formatter and its `$effect` now rebuilds the chart when `values`/formatters change (removed the `!isInitialized` guard). Regression test asserts a formatter change triggers a new `setOption` with the new centre text.
- **TASK-5 (`993be1f`)** — All Finance surfaces now format through `formatCurrency` with the user's currency and language, and `europeanFormat` is gone. `grep -rn europeanFormat src tests` is empty.

## Changes

- `src/lib/config/currency.ts` (new) — supported list, type, default, guard.
- `src/lib/helpers/NumberHelper.ts` — added `formatCurrency`, removed `europeanFormat`.
- `src/lib/types/auth.ts` — `UserSettings.currency`.
- `src/lib/config/apiRoutes.ts` — `updateCurrency` endpoint.
- `src/lib/state/Auth.svelte.ts` — `updateCurrency()`.
- `src/lib/components/settings/LocalizationSettings.svelte` — currency picker.
- `src/lib/i18n/en.ts`, `src/lib/types/translation.ts` — `settings.currency` key/type.
- `src/lib/components/charts/DoughnutChart.svelte` — neutral formatter defaults + rebuild on formatter change.
- `src/routes/finances/+page.svelte`, `routes/finances/budget/+page.svelte`, `routes/finances/wealth/+page.svelte` — local `formatMoney()` wrapper, chart formatter props, doughnut keyed on currency+language.
- `src/lib/components/finances/BudgetField.svelte`, `WealthField.svelte`, `FinanceHistory.svelte` — take a `valueFormatter` prop instead of reading auth themselves (STANDARDS 3.3: state stays in the parent).
- Tests: `tests/unit/helpers/NumberHelper.test.ts`, `tests/unit/auth/Auth.test.ts`, `tests/components/localization-settings.test.ts`, `tests/components/doughnut-chart.test.ts`, `tests/components/finance-rows.test.ts`, `tests/components/finance-budget-page.test.ts`.

## Known issues / follow-ups

- **Translations:** `de`, `fr`, `es`, `it`, `ru` still need `settings.currency`. Phil owns that commit; until it lands `npm run check` reports exactly those 5 missing keys and nothing else.
- **Lint:** `npm run lint` fails on a pre-existing file under `.opencode/jobs/archive/one_profile-picture-doesnt-load/repro/prod-service-worker.js` (18 errors) — unrelated to this change and not staged.
- **Build:** `npm run build` was not run before the implementation turn was stopped.
- **Deviation from the drafted plan:** TASK-5 passes a `valueFormatter` prop to `BudgetField`/`WealthField`/`FinanceHistory` instead of calling `getAuth()` inside them, to comply with `docs/STANDARDS.md` §3.3 (auth/settings never read in a leaf).
