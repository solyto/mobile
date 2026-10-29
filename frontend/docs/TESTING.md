# Testing

How tests are written in this repository. The rule in one line:

> Test logic and contracts, not markup, and not third-party internals.

Run with `npm test` (`vitest run`), `npm run test:watch`, or
`npm run test:coverage`. Coverage is a signal, not a target: the denominator
is all of `src/lib`, most of which is render-only components and CRUD
wrappers that are deliberately untested.

## Layout and projects

`vitest.config.ts` defines three projects. Every file under `tests/` lands in
exactly one of them by path:

| Project      | Path                        | Environment | Setup                         |
| ------------ | --------------------------- | ----------- | ----------------------------- |
| `unit`       | `tests/unit/**` (not stores) | node        | none                          |
| `stores`     | `tests/unit/stores/**`      | node        | `tests/unit/setup/storeMocks.ts` |
| `components` | `tests/components/**`       | jsdom       | `tests/setup/component.ts`    |

All three run with `TZ=UTC`, the `$lib` alias, and the SvelteKit Vite plugin
(so `.svelte.ts` runes and `$app/*` resolve). The `components` project adds
`resolve.conditions: ['browser']` so `svelte` resolves to the client build.

```
tests/
  unit/            helpers, services, config, effects, musictheory, auth
  unit/stores/     state stores (module mocks active)
  unit/setup/      storeMocks.ts
  components/      component tests, helpers/context.ts + ContextHarness.svelte
  setup/           component.ts (jsdom stubs)
```

## What gets a test

- **Pure helpers and services** (`src/lib/helpers/*`, `src/lib/services/*`):
  always. Plain input → output, no mocks. Parsers and serialisers include
  inputs that must round-trip unchanged (`STANDARDS.md` 13.1).
- **Stores**: the methods with real logic (filtering, grouping, date math,
  persistence, recovery flows). Not the CRUD wrappers (`create`/`update`/
  `delete` = call `ApiService`, reload); prove that shape once per store
  and move on.
- **Components**: only those that carry logic (keyboard handling,
  selection, props-driven data). Render-only icons, logos and dividers get
  nothing.
- **`ApiService`**: the one network seam. Stub `globalThis.fetch` and assert
  method, URL (`%s`/`%d` replacement), headers and return semantics.

Not tested, on purpose: third-party behaviour (echarts, TipTap/ProseMirror,
svelte-dnd-action, svelte-gestures, WebAuthn, electronAPI, clipboard API,
canvas). Assert our props and logic, never their internals. There is no E2E
layer.

## Store tests

The `stores` project's setup file mocks `$app/state`, `$lib/state/Auth.svelte`,
`$lib/services/ApiService` and `$lib/services/LocalStorageService` for every
test in it, so `new Todos()` works without a Svelte context and `ApiService`
methods are `vi.fn()`s that return `null` unless stubbed.

With constructor injection (`STANDARDS.md` 15.2) a test can also pass its
own collaborators and skip the module mocks entirely:

```ts
const api = { list: vi.fn().mockResolvedValue({ data: [todo()] }) } as unknown as ApiService;
const store = new Todos(mockAuth, api, fakeStorage);
await store.load();
expect(store.filteredTodos).toHaveLength(1);
```

`Auth` itself is tested under `tests/unit/auth/` (the `unit` project), because
the stores setup replaces the `Auth` module.

## Component tests

Components read stores through `getX()`, so render them through
`renderWithContext()` from `tests/components/helpers/context.ts`. It mounts
`ContextHarness.svelte`, which seeds `setTranslation`, `setKeyManager`,
`setTodos`, `setAuth`, `setLoadingIndicator`, `setUiNotifications`,
`setViewPoint` and `setCookieConsent` before rendering the component under
test. Props-driven leaves (dashboard widgets, form primitives) need no
context and are rendered directly.

`tests/setup/component.ts` stubs what jsdom lacks: `Element.prototype.animate`
(Svelte transitions), `window.matchMedia` (`Viewpoint`), and the
`$env/dynamic/public` virtual module. Add further stubs (`ResizeObserver`,
`IntersectionObserver`, `navigator.clipboard`) there, not per test.

## Caveats

- **`SvelteDate` ignores `vi.setSystemTime`.** `svelte/reactivity` captures
  the native `Date` at module load, so fake timers never reach it. Code that
  reads "now" through `SvelteDate` must be asserted against the real
  `new Date()`; a hardcoded "today" only passes on the day it was written.
- Timers and `tick`: stores that use `setTimeout`/`setInterval` are tested
  with `vi.useFakeTimers()` and `await tick()`/`flushSync`.
- `$app/state`'s `page` is a static mock in node; code that reacts to
  navigation is covered at the component level, not in store tests.
- When a component test asserts a UI string, the key must exist in all four
  locales; `npm run check` enforces it.
- New dev-dependencies are pinned and installed only with approval
  (`AGENTS.md`).
