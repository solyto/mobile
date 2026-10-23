# Verdict: 28 Hide features of unconfigured integrations

id: improvement
reviewer: @reviewer
date: 2026-10-15

## Review

Branch checked: `feature/improvement_28-hide-features-of-unconfigured-integrations`, which matches the brief. Diff reviewed: `git diff main...HEAD`.
Every changed source file is covered by tasks.md and implementation.md. Nothing outside scope changed.

TASK-1: PASS
notes: `src/lib/types/integration.ts` matches the API shape. `apiRoutes.integrations` is a top-level entry, following STANDARDS 15.3.

TASK-2: PASS
notes: `src/lib/state/Integrations.svelte.ts` follows STANDARDS 15.2 and 15.4: member order, constructor collaborators with defaults, a Symbol key, and `setX`/`getX`. `load()` is idempotent once `loaded` is set. When `ApiService.get` returns null, the previous state stays and `loaded` stays false. `isConfigured()` uses `!== false`, so a flag that is unknown or missing counts as visible. `setIntegrations()` runs after `setAuth()` in the root layout. The tests cover the four cases tasks.md asks for, plus a retry. `resetStoreMocks()` resets `api.get` so it returns undefined, which is what makes the failure case work.

TASK-3: PASS
notes: The books, movies and games layouts add `integrations.load()` to their existing `Promise.all`. The settings layout calls it fire-and-forget in `onMount`. That is fine, because `NotificationSettings` reads `isConfigured()` reactively in markup.

TASK-4: PASS
notes: `NotificationSettings.svelte` hides the Telegram section and passes `showTelegram` down. This follows STANDARDS 3.3: the leaf gets visibility as a prop and does not read the store. `ManageNotificationTypes.svelte` filters with a plain function (`visibleChannels()`), not `$derived`. The static `channels` array and the setting keys are unchanged, and the "not connected" hint is gated on `showTelegram`. The existing hardcoded English strings were left alone, as instructed.

TASK-5: PASS
notes: `BookCreate.svelte` gates `CreateModalSearchButton` and drops the Hardcover import option. `CreateModalSearchButton` is the only caller of `openExternalSearchModal()`, so `BookSearch` can't be reached when Hardcover is unconfigured. `importOptions` is a plain const, and that is safe here: `BookCreate` only mounts when `library.createModalVisible` is set (`routes/libraries/books/+page.svelte`), which is after the layout's load. The same holds for TASK-6 and TASK-7.

TASK-6: PASS
notes: `MovieCreate.svelte` follows the same pattern for TMDB, and IMDb stays.

TASK-7: PASS
notes: `GameCreate.svelte` drops the BGG import option and passes `showBgg` to `GameSearch.svelte`. `GameSearch` builds its sources from that prop, and Steam stays. `GameSearch` is mounted conditionally (`externalSearchModalVisible`), so capturing the prop value once at init is correct.

TASK-8: PARTIAL
notes: `npm run check`, `npm run lint` and `npm test` were not run. There is no `node_modules` in the worktree, and installing packages needs approval. I couldn't run them either. The manual runs against a local API, one with Telegram/Hardcover/TMDB/BGG unset and one without the endpoint, were also not done. Reading the code, I found no type or logic errors. This is a step for a human before merge, not rework for the developer.

## Security

None. The change is read-only: a GET of non-sensitive booleans, and nothing new is stored or logged.

## Overall

APPROVED

The implementation matches tasks.md and STANDARDS, and nothing out of scope changed. Before merging, a human with dependencies installed should run `npm ci && npm run check && npm run lint && npm test` and do the manual API runs from TASK-8. These checks are not in place yet; they are not code changes.
