# Tasks: currencies-v2

id: perfetto
analyst: paulie (drafted by ralphie)
date: 2026-11-25

<!-- Produced from brief.md. One task per commit. -->

## Task breakdown

### TASK-1: Currency list + pure `formatCurrency` helper + unit tests

description:
- Create `src/lib/config/currency.ts`:
  - `SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'RUB'] as const`
  - `export type Currency = (typeof SUPPORTED_CURRENCIES)[number]`
  - `export const DEFAULT_CURRENCY: Currency = 'EUR'`
  - `export function isSupportedCurrency(value: string | null | undefined): value is Currency`
- Add `formatCurrency(amount, currency, language)` to `src/lib/helpers/NumberHelper.ts`:
  - Resolve `currency` via `isSupportedCurrency`; anything missing/unknown → `DEFAULT_CURRENCY`.
  - Format with `new Intl.NumberFormat(language || 'en', { style: 'currency', currency })` (default `currencyDisplay`, so CAD/AUD stay distinguishable).
  - If the language tag is invalid (`Intl` throws `RangeError`), retry with `'en'`; never throw.
  - Do **not** hardcode `de-DE` / `EUR` anywhere.
- Add `formatCurrency` cases to `tests/unit/helpers/NumberHelper.test.ts`: language-dependent separators (`de` vs `en`), a non-EUR code (`USD` → `$`), missing and unknown currency → EUR, invalid language does not throw. Keep the existing `europeanFormat` suite until TASK-5 removes the helper.

files:
- `src/lib/config/currency.ts` (new)
- `src/lib/helpers/NumberHelper.ts`
- `tests/unit/helpers/NumberHelper.test.ts`

depends: none
risk: low — isolated pure function.

### TASK-2: Persist the currency setting

description:
- Add `currency: Currency` to `UserSettings` in `src/lib/types/auth.ts` (import `Currency` from `$lib/config/currency`).
- Add `updateCurrency: API_URL + '/users/me/settings/currency'` under `users.settings` in `src/lib/config/apiRoutes.ts` (resolves to `/api/v1/users/me/settings/currency`).
- Add `async updateCurrency(currency: Currency): Promise<boolean>` to `src/lib/state/Auth.svelte.ts`, mirroring `updateWeekStart`: `PUT` body `{ currency }`; on success set `this.user.settings.currency = currency` and `this.save()`. Do not force a full reload.
- Contract confirmed by Paulie: API validates `required|string|in:EUR,USD,GBP,CHF,CAD,AUD,RUB`; `UserSettingsResource` returns `currency` with `?? "EUR"`.

files:
- `src/lib/types/auth.ts`
- `src/lib/config/apiRoutes.ts`
- `src/lib/state/Auth.svelte.ts`

depends: TASK-1 (Currency type)
risk: medium — cross-repo API contract; wrong path/key silently breaks saving.

### TASK-3: Currency picker in localization settings

description:
- Add a `SettingsSection` + `Select` row to `src/lib/components/settings/LocalizationSettings.svelte` after week start, making the localization block's sixth row (language, timezone, date format, time format, week start, currency). Do not move the temperature-unit toggle out of `WeatherWidget.svelte`.
  - Value: `auth.user?.settings?.currency ?? DEFAULT_CURRENCY`.
  - Options from `SUPPORTED_CURRENCIES`; label `${code} ${symbol}`, symbol from `Intl.NumberFormat('en', { style: 'currency', currency }).formatToParts(0)` (`currency` part). No translated currency names.
  - Handler calls `auth.updateCurrency(value as Currency)`.
- Add `currency: 'Currency'` to the `settings` block in `src/lib/i18n/en.ts` and `currency: string` to `SettingsRecords` in `src/lib/types/translation.ts`.
- Extend `tests/components/localization-settings.test.ts`: the row shows `EUR` by default, changing it calls `Auth.prototype.updateCurrency` with the code, and the picked value stays visible. Include `currency` in the test user fixture.
- Hand the single new key to the translator agent/human for `de/fr/es/it/ru`; do not translate inline.

files:
- `src/lib/components/settings/LocalizationSettings.svelte`
- `src/lib/i18n/en.ts`
- `src/lib/types/translation.ts`
- `tests/components/localization-settings.test.ts`

depends: TASK-1, TASK-2
risk: medium — locale-key parity makes `npm run check` fail until the other five locales are filled.

### TASK-4: Make `DoughnutChart` rebuild when its formatter changes

description:
- In `src/lib/components/charts/DoughnutChart.svelte`, remove the `europeanFormat` import and the money-specific default props; default to a neutral `String` formatter (same as `BarChart`).
- Change the chart lifecycle so a formatter/values change rebuilds the chart (mirror `SmoothLineChart`'s `$effect` that calls `createChart()`, which disposes and re-inits). Remove the `!isInitialized` guard that blocks rebuilds. Avoid a double init from `onMount` + `$effect` (keep `onMount` for the resize listener only).
- Add a regression test in `tests/components/doughnut-chart.test.ts`: render with `centerFormatter` A, rerender with B, assert `setOption` runs again and the centre title uses B.

files:
- `src/lib/components/charts/DoughnutChart.svelte`
- `tests/components/doughnut-chart.test.ts`

depends: TASK-1 (for `formatCurrency` only if a default is kept; `String` is enough)
risk: medium — chart lifecycle and jsdom/echarts mock; time-tracking passes both formatters already, so it must stay unchanged.

### TASK-5: Migrate Finance surfaces to `formatCurrency`, delete `europeanFormat`

description:
- Route pages already hold `const auth = getAuth()`: `src/routes/finances/+page.svelte`, `src/routes/finances/budget/+page.svelte`, `src/routes/finances/wealth/+page.svelte`. In each add a local
  `function formatMoney(value: number): string { return formatCurrency(value, auth.user?.settings?.currency, auth.user?.settings?.language); }`
  and replace every `europeanFormat(...)` with `formatMoney(...)`. Reading settings inside the call keeps it reactive.
- Child components do **not** import auth today; add `const auth = getAuth()` at init (context is provided by the root layout, and by `ContextHarness` in tests):
  - `src/lib/components/finances/BudgetField.svelte` (lines ~92, ~96)
  - `src/lib/components/finances/WealthField.svelte` (line ~84)
  - `src/lib/components/finances/FinanceHistory.svelte` (lines ~62, ~191; also pass `valueFormatter={formatMoney}` to `SmoothLineChart` at ~151)
- Chart formatter props:
  - `BarChart`, `SmoothLineChart` and `StackedAreaChart` receive `formatMoney`.
  - Finance doughnuts must stop relying on defaults: pass `centerFormatter={formatMoney}` and `valueFormatter={formatMoney}` in `src/routes/finances/+page.svelte` (~96) and `src/routes/finances/wealth/+page.svelte` (~93). Since `formatMoney` has a stable identity, wrap the doughnut in `{#key currency + '-' + language}` (or recreate the formatter when settings change) so TASK-4's rebuild runs on a currency/language switch.
- Delete `europeanFormat` from `src/lib/helpers/NumberHelper.ts` and its `describe` block/import from `tests/unit/helpers/NumberHelper.test.ts`.
- Add one wiring assertion to `tests/components/finance-rows.test.ts` (or a small new component test): with auth settings `{ currency: 'USD', language: 'en' }`, a rendered amount uses the `$` symbol and en separators.
- Done check: `grep -rn europeanFormat src tests` returns nothing; `grep -rn "formatCurrency" src/routes/finances src/lib/components/finances` shows every site wired.

files:
- `src/routes/finances/+page.svelte`
- `src/routes/finances/budget/+page.svelte`
- `src/routes/finances/wealth/+page.svelte`
- `src/lib/components/finances/BudgetField.svelte`
- `src/lib/components/finances/WealthField.svelte`
- `src/lib/components/finances/FinanceHistory.svelte`
- `src/lib/helpers/NumberHelper.ts`
- `tests/unit/helpers/NumberHelper.test.ts`
- `tests/components/finance-rows.test.ts`

depends: TASK-1, TASK-2, TASK-4
risk: high — many call sites plus reactivity; easy to leave one stale chart or a captured non-reactive setting.

### TASK-6: Verification pass

description:
- Run `npm run check`, `npm run lint`, `npm test`, `npm run build` and report the exact results.
- Confirm `grep -rn europeanFormat src tests` is empty and no new dependency was added.
- Manual/`shot` check: switch currency and language in `/settings`, then confirm `/finances`, `/finances/budget`, `/finances/wealth` show the new symbol and separators immediately — including the doughnut centre total and chart tooltips.
- Confirm the five other locale files were filled (translator/human) so `npm run check` passes.

files: none (verification only)
depends: TASK-1 … TASK-5
risk: low.
