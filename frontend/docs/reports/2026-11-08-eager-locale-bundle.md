# Report: all six locales ship in the root-layout bundle
read: true

Date: 2026-11-08
Scope: startup cost of `src/lib/state/Translation.svelte.ts`.
Method: read the store, ran `npm run build` at `9dbd24b`, inspected
`build/client/_app/immutable/`, and minified each locale on its own with esbuild
(`--charset=utf8`, the same as Vite) to get per-locale sizes. No code was changed.

**Overall: one easy performance win.** Every visitor downloads, parses and keeps in
memory the strings for all six languages, but only ever uses one.

---

## 1. Finding (verified)

`Translation.svelte.ts:3-8` imports `en`, `de`, `fr`, `es`, `it` and `ru`
statically. The store is created in the root `+layout.svelte`, so Vite puts all
six tables into one shared chunk that the root layout node (`nodes/0`) imports
statically. That puts it on the critical path of every first load, on every
route, including `/auth/login` and `/setup`.

| | raw | gzip | brotli |
|---|---:|---:|---:|
| Locale chunk (`chunks/DJxNbrbH.js`, all six) | 335 KB | 101 KB | 73 KB |
| All direct chunk deps of `nodes/0` (brotli) | | | 160 KB |
| Root layout node itself (brotli) | | | 12 KB |

So the translations make up **about 46 %** of what the root layout pulls in
directly.

Per locale, minified on its own:

| Locale | min | gzip |
|---|---:|---:|
| en | 48 KB | 15 KB |
| de | 54 KB | 17 KB |
| fr | 56 KB | 17 KB |
| es | 54 KB | 17 KB |
| it | 53 KB | 17 KB |
| ru | 74 KB | 20 KB |

A user needs `en` (the fallback) plus at most one other locale: about 30–35 KB
gzip instead of 101 KB. The parse/compile cost on mobile drops by about the same
factor (≈ 100–130 KB of JS instead of 335 KB), and so does the heap held by six
large object literals.

The cost will grow too: each new locale or new key gets multiplied by six.

## 2. Suggested change

Keep `en` static, since it is the default and the type reference, and load the
others through dynamic `import()` so Vite gives each its own chunk:

```ts
const loaders: Record<Exclude<Language, 'en'>, () => Promise<LanguageFile>> = {
	de: () => import('$lib/i18n/de').then((m) => m.de),
	fr: () => import('$lib/i18n/fr').then((m) => m.fr),
	es: () => import('$lib/i18n/es').then((m) => m.es),
	it: () => import('$lib/i18n/it').then((m) => m.it),
	ru: () => import('$lib/i18n/ru').then((m) => m.ru),
};

async changeLanguage(locale: Language): Promise<void> {
	this.get = locale === 'en' || !(locale in loaders) ? en : await loaders[locale]();
	this.locale = locale in loaders ? locale : 'en';
	if (browser) document.documentElement.lang = this.locale;
}
```

This also replaces the six-case `switch` with a table.

Things to handle (this is where the actual work is):

1. **Flash of English.** Today `loadLanguage()` runs in `onMount` of
   `+layout.svelte:114` and switches synchronously, so a German user already gets
   one English render that is very likely replaced before paint. With an async
   import, the English frame could become visible for one network round-trip.
   Options: keep the existing `LoadingIndicator`/spinner until the first
   `loadLanguage()` resolves when the locale is not `en`, or start the import
   as early as possible (store constructor, from the stored user setting /
   `navigator.language`).
2. **Callers.** `changeLanguage` becomes async. The callers are
   `LocalizationSettings.svelte:62`,
   `OnboardingModalStepLocalization.svelte:45` and the two `loadLanguage()` calls
   in `auth/login/+page.svelte:60,91`. None of them depend on the result being
   available synchronously, but check each one.
3. **Offline / PWA.** `service-worker.ts` precaches `build` (all chunks), so the
   split locale chunks are still available offline. No change is needed there.
   For installed PWAs the total bytes downloaded stay the same. The win is the
   first visit (before the SW is installed) and parse/memory on every start.
4. **Tests.** No existing test calls `changeLanguage` or `new Translation`
   (checked with grep), so nothing breaks. A small store test
   (`tests/unit/stores/`) can cover "unknown locale falls back to `en`" and "the
   locale is set after the load resolves".
5. **Type parity.** `npm run check` checks that every locale matches
   `LanguageFile` through the per-file type annotation, not through the import
   in the store, so it keeps working.

## 3. Expected effect

- About 65–70 KB less (gzip) on the critical path of the first load for every
  user, about 45 % of the root layout's direct dependencies.
- 200+ KB less JS to parse at startup and a smaller resident heap. This matters
  most on low-end phones, where the mobile shell runs.
- Adding new locales no longer costs every user.

## 4. How to verify

`npm run build`, then confirm that `build/client/_app/immutable/chunks/` has one
chunk per non-English locale and that none of them shows up in the static
`import` list of `nodes/0.*.js`. Load `/` with a German browser locale and check
in DevTools that only the `de` chunk is fetched and no English frame is visible.
