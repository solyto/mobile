# Brief: currencies-v2

type: feature
id: perfetto
branch: feature/perfetto_currencies-v2
date: 2026-11-25
author: Leander Muskalla

## What

Add a user-wide **display currency** to the frontend so all money is rendered in the user's chosen currency, independent of the UI language.

- Supported codes (v1): `EUR, USD, GBP, CHF, CAD, AUD, RUB`. Default and fallback: `EUR`.
- One pure formatter `formatCurrency(amount, currency, language)` in `src/lib/helpers/NumberHelper.ts`, built on `Intl.NumberFormat(language, { style: 'currency', currency })`. Grouping/decimal separators follow the UI language; the currency and the language are chosen independently.
- A currency `Select` as the sixth row of the existing localization block in `src/lib/components/settings/LocalizationSettings.svelte`, which contains language, timezone, date format, time format, week start and currency. Label "Currency" only; options show code + symbol, no translated currency names. The temperature-unit toggle stays in `WeatherWidget.svelte`; moving it is out of scope.
- Persist the choice with `PUT /users/me/settings/currency` (`{ "currency": "EUR" }`), mirroring how `week_start` is stored and applied locally.
- Migrate every Finance money surface off `europeanFormat` to the new formatter and delete `europeanFormat` (no dead code).
- Fix `DoughnutChart` so a currency/language switch cannot leave stale formatting on screen.

## Why

Money is currently hardcoded to EUR with German separators (`europeanFormat` → `de-DE` / `EUR`) regardless of the user's language or location, so non-euro users see the wrong symbol. A single user-wide display currency fixes that without touching stored amounts; nothing is converted.

## Out of scope

- FX conversion, exchange rates, historical currency.
- Per-budget / per-wealth-field / per-entry currency.
- Currencies outside the seven above (LATAM, JPY, CNY, INR, ...).
- A backend list endpoint — the app hardcodes the same seven codes; the API validates them.
- Server-side formatting (formatting lives in the frontend).
- Moving the temperature unit into `LocalizationSettings`.
- Unrelated Finance refactors, new dependencies, or changing chart libraries.

## Notes

- **Cross-repo contract** (confirmed by Paulie; API job = blundetto): `user_settings.currency` is `string(3) NOT NULL DEFAULT 'EUR'`, placed after `week_start`; `PUT /api/v1/users/me/settings/currency` takes `{ "currency": "EUR" }`, validates `required|string|in:EUR,USD,GBP,CHF,CAD,AUD,RUB`, and returns `Currency updated successfully.`; `UserSettingsResource` exposes `currency` with `?? "EUR"`. The app route is therefore `API_URL + '/users/me/settings/currency'`, which resolves to `/api/v1/users/me/settings/currency`.
- **Single source for the list:** put `SUPPORTED_CURRENCIES`, the `Currency` type, `DEFAULT_CURRENCY` and `isSupportedCurrency()` in a new `src/lib/config/currency.ts`, and import from there in `types/auth.ts`, `NumberHelper.ts` and the settings picker. Do not duplicate the seven codes.
- **Language vs currency are independent:** `language` controls separators/placement (`1.234,50 €` vs `€1,234.50`); `currency` controls the symbol. Never derive one from the other.
- **`europeanFormat` removal is a done criterion:** after TASK-5 `grep -r europeanFormat src tests` returns nothing.
- **`DoughnutChart` gotcha:** it currently builds once (`$effect` guards on `!isInitialized`), so changing the formatter after mount leaves the old centre total. See TASK-4; add a regression test.
- **Translations:** add the `settings.currency` key to `en.ts` + `src/lib/types/translation.ts` only. The other five locales (`de`, `fr`, `es`, `it`, `ru`) must be filled by the translator agent/human before `npm run check` can pass, because every locale file must carry the same keys. Do not translate inline.
- **Minimal copy:** one "Currency" label. No helper text, no currency names.
- **Environment:** Node 22, TypeScript strict, Svelte 5 runes, Tailwind 4. No new packages.
- **Commands:** `npm run check`, `npm run lint`, `npm test`, `npm run build`.
  - Focused during TASK-1/TASK-5: `npx vitest run tests/unit/helpers/NumberHelper.test.ts`
  - Focused during TASK-3/TASK-4: `npx vitest run tests/components/localization-settings.test.ts tests/components/doughnut-chart.test.ts`
