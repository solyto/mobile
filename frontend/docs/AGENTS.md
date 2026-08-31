# solyto frontend

<!--
This is your project context, loaded by the agent at the start of every session.
manigot is vendor-agnostic: it runs Claude Code or OpenCode against the same
project (`mg --profile claude-pro` vs `mg --profile zai`/`--profile
opencode-go`), and this one file serves both — manigot mounts it read-only
wherever the selected tool looks for it
(/workspace/AGENTS.md for OpenCode, /workspace/.claude/CLAUDE.md for Claude
Code). Those mount paths are read-only: to change this context, edit this
file (docs/AGENTS.md), never the mount paths.
The same global agents are available under @name either way, and custom
project agents in docs/agents/ work under both tools — write them in the
built-in format (name:, description:, tools: Read, Grep, ...), no per-tool
format needed. To make a custom agent read-only under OpenCode, add a
`permission:` frontmatter block (the built-in format manigot's conversion
passes through to OpenCode's schema — see the manigot README's agent section);
the read-only built-in agents' blocks deny the destructive git commands
(worktree management, branch -d/-D, reset, checkout, push, ...).
Custom agents that must commit (like the built-in developer/reviewer/quality)
declare `commit: true` in their frontmatter; agents that never commit declare
`commit: false` and get a read-only git mount. The default — no agent named,
file missing, or marker absent/unknown — is a writable git mount, so a
committing agent is never broken by a missing marker.
Agent sessions also restrict git to reading history and making commits (the
session git shim): worktree management, branch deletes, resets, checkouts,
pushes, and the other destructive subcommands are refused.
Keep this file tool-neutral — write it for "the agent", not for one vendor.
-->

The client for [solyto.app](https://solyto.app): a free, private, all-in-one personal management app — todos, notes, calendar, contacts, media libraries, check-in, finances, feeds, time tracking, clipboard, and dev-requests in one place. This repo is the frontend only: a SvelteKit 2 / Svelte 5 single-page app that runs on the web, as an installable PWA, or as a native desktop/mobile shell. There is no backend or database here — every piece of data comes from the solyto REST API, which lives in a separate repository.

## Stack
- Backend: none in this repo — pure client-side SPA. Consumes the solyto REST API at `/api/v1` (`api.solyto.app` in prod, `http://localhost:8000` in dev; configurable per hostname in `src/lib/config/platform.ts`).
- Frontend: SvelteKit 2, Svelte 5 (runes, `$state`), TypeScript (strict), Vite 7, Tailwind CSS v4 via `@tailwindcss/vite`, adapter-node (outputs to `build/`).
- Database: none — persistence is owned by the backend. The client only stores auth tokens, theme, and preferences in LocalStorage (`src/lib/services/LocalStorageService.ts`).
- Key packages: `@tiptap/*` (notes rich-text editor), `echarts` (statistics charts), `@simplewebauthn/browser` (passkey login), `marked` + `dompurify` (markdown), `@lucide/svelte` (icons), `svelte-dnd-action` / `svelte-gestures` (drag & drop, swipe), `canvas-confetti`, `@fontsource/*`, `@vvo/tzdb`.

## Architecture
- `src/routes/` — SvelteKit file-based routes, all client-rendered (no `+page.server.ts`/`+server.ts` anywhere). The root `+layout.svelte` bootstraps every state store via `setContext`, guards unauthenticated access (redirect to `/auth/login` or `/setup`), and renders the navbar/footer shells. Feature routes: `/todos`, `/notes`, `/calendar`, `/contacts`, `/check-in`, `/finances`, `/feeds`, `/time-tracking`, `/clipboard`, `/dev-requests`, `/libraries/{books,movies,music,games,links,quotes,recipes,plants}`, plus `/settings`, `/admin`, `/profile`, `/auth/*`, `/setup`, `/share`.
- `src/lib/state/` — one Svelte 5 runes class per domain (`Auth`, `Todos`, `Notes`, `Calendars`, `BookLibrary`, ...). Instances are created in `+layout.svelte` and shared through Svelte context (`setContext`/`getContext`); each store fetches via `ApiService` and holds the result in reactive `$state`.
- `src/lib/services/` — `ApiService` (fetch wrapper over the REST API: Bearer auth, JSON, `%s`/`%d` URL placeholders, FormData uploads) and pure domain services (`TodoFilterService`, `TodoSortingService`, `TodoGroupingService`, `TodoRelevanceService`, `LibraryFilterService`, `WealthStatisticsService`, ...) that are unit-tested.
- `src/lib/config/` — `apiRoutes.ts` (all endpoints, composed from `getApiUrl()` + `/api/v1`), `platform.ts` (web vs. desktop vs. mobile via `PUBLIC_DESKTOP`/`PUBLIC_MOBILE`, API URL resolution), `themes.ts`, `navigation.ts`, `urls.ts`, `features.ts`.
- `src/lib/components/` — feature components plus shared `ui/` (buttons, modals, navbar), `forms/` (inputs, pickers, toggles), and `charts/` (echarts wrappers). Several features keep separate desktop/mobile view variants (e.g. `calendars/views/{day,week,month,list}`, `todos/views/`).
- `src/lib/types/` — TypeScript interfaces mirroring the API data model, one file per domain (`todo.ts`, `note.ts`, `library_*.ts`, `calendar.ts`, ...).
- `src/lib/i18n/` — translation tables `en.ts`, `de.ts`, `es.ts`, `fr.ts`, typed via `types/translation.ts`; every UI string must exist in all four.
- `src/lib/helpers/` — pure utilities (DateHelper, NumberHelper, FormatHelper, ColorHelper, MusicTheory, ...).
- `src/service-worker.ts` — PWA service worker (app-shell precache, stale-while-revalidate, push notifications); `static/site.webmanifest` is the PWA manifest, `static/themes/*` are runtime-loaded theme CSS.
- `tests/` — Vitest unit tests for pure helpers/services only (no component or integration tests); run in node env with `TZ=UTC` and `$lib` aliased to `src/lib`.
- Data flow: component → state store → `ApiService` → REST API. There is no server-side rendering of app data.

## Commands
- `npm run dev` — start the Vite dev server on port 5173 (expects the API at `http://localhost:8000`)
- `npm run build` — production build via `vite build` (adapter-node, output in `build/`)
- `npm run preview` — preview the production build locally
- `npm run check` — type-check with `svelte-check` (a11y warnings selectively ignored)
- `npm run lint` — `prettier --check .` + `eslint .`
- `npm run format` — auto-format with `prettier --write .`
- `npm test` / `npm run test:watch` — run Vitest unit tests / watch mode
- `make deploy` / `make audit` — Ansible deploy (external `deployment/` repo) / `npm audit` + `npm outdated`

## Hard rules
- NEVER modify files outside /workspace
- NEVER install packages without asking (dependencies are pinned, `engine-strict=true`)
- NEVER commit secrets: auth tokens, API keys, or `.env*` files (gitignored); never log or print token or user data
- NEVER hand-edit generated output — `build/` and `.svelte-kit/` are regenerated by `npm run build` / `npm run check`
- When adding or changing UI strings, keep all four i18n files (`en`, `de`, `es`, `fr`) in sync — `npm run check` enforces it
- When scope is unclear: ask, don't guess
- Do not refactor things unrelated to the current task
- Do not add abstractions not already present in the codebase
