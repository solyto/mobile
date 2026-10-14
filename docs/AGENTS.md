# [Project Name]

<!--
This is your project context, loaded by the agent at the start of every session.
manigot is vendor-agnostic: it runs Claude Code or OpenCode against the same
project (`mg --profile claude-pro` vs `mg --profile zai`/`--profile
opencode-go`/`--profile opencode-zen`/`--profile opencode-zen-free`/`--profile
deepseek-direct`), and this one file serves both — manigot mounts it read-only
wherever the selected tool looks for it
(/workspace/AGENTS.md for OpenCode, /workspace/.claude/CLAUDE.md for Claude
Code). Those mount paths are read-only: to change this context, edit this
file (docs/AGENTS.md), never the mount paths.
"Global" agents, skills, MCP servers and policies below span two sources:
manigot's own core content (from a located checkout when one exists, else
the copy embedded in the installed binary), and catalog-installed content in
your user data dir (`$MANIGOT_DATA_DIR`, else `$XDG_DATA_HOME/manigot`, else
`~/.local/share/manigot`), which overrides core content of the same name;
project content in docs/ overrides both. Catalog content is installed on
demand from the defaults catalog with `mg defaults install` (run on the host,
never from inside a session); the core agents never come from there.
The same global agents (from the checkout or the embedded copy — mounted read-only into
the container at the CLI's global agent location, or delivered into the host
CLI's config for `mg host`: symlinked for Claude Code, converted for OpenCode)
are available under @name either way, and custom
project agents in docs/agents/ work under both tools — write them in the
built-in format (name:, description:, tools: Read, Grep, ...), no per-tool
format needed. To make a custom agent read-only under OpenCode, add a
`permission:` frontmatter block (the built-in format manigot's conversion
passes through to OpenCode's schema — see the manigot README's agent section);
the read-only built-in agents' blocks deny the destructive git commands
(worktree management, branch -d/-D, reset, checkout, push, ...).
Global skills (catalog-installed into your user data dir via
`mg defaults install` — the manigot checkout ships none; mounted read-only into
the container at the CLI's global skills location, or delivered into the host
CLI's config for `mg host`: symlinked dirs for Claude Code, copied dirs for
OpenCode) are loaded by the CLI at startup and are available to every agent
and to agentless invocations; custom project skills in `docs/skills/`
(`<name>/SKILL.md`, overriding global skills of the same name) work under both
tools the same way — write them in the standard format (a directory with a
SKILL.md carrying name:/description: frontmatter, plus optional support
files), no per-tool format needed.
Global MCP (Model Context Protocol) server definitions (JSON files, one per
server — catalog-installable into your user data dir via `mg defaults
install mcp/context7`; the manigot checkout ships none) are merged with any custom
project servers in `docs/mcp/` (same filename overrides the global server
entirely, a new filename adds one) and delivered into every session: manigot
resolves `$VARNAME` tokens in each server's config against its own `.env`
host-side, converts the merged, resolved set into whichever CLI is running,
and mounts it read-only — a generated `.mcp.json` for Claude Code, folded
into OpenCode's config for OpenCode. A server definition never carries a
literal secret; write one in the standard format (`{"type": "http", "url":
"...", "headers": {"SOME_KEY": "$SOME_KEY"}}` for a hosted server, or
`{"type": "stdio", "command": "...", "args": [...], "env": {"SOME_KEY":
"$SOME_KEY"}}` for a locally-spawned one), no per-tool format needed.
Unlike agents/skills (which `mg host` still delivers, via a symlink/copy
into your own CLI config), `mg host` sessions don't deliver MCP servers at
all — they'd need to already be configured in your own CLI's own config.
Policies (from manigot's global `policies/` — plain markdown files,
one per file; installed on demand with `mg defaults install policies/<name>`
on the host, never from inside a session) are merged with any custom project
policies in `docs/policies/`
the same way (same filename overrides the global policy entirely, a new
filename adds one), but unlike a skill a policy is *unconditionally
injected* into this very context file rather than relevance-triggered — a
standing rule like "always use PSR-12 in this project" must not depend on
the agent deciding a skill's description matches. A stack-specific policy
can be picked for this project alone with `mg policies add <kind>/<name>`,
which copies the catalog policy into `docs/policies/<name>.md` (never
committed — review and commit it like any other docs/ edit; remove the
project's own copy with `mg policies rm <name>`). The merged policies are
concatenated (sorted by filename, joined with a blank line) and appended
after this file's own content when mounted; with no `docs/AGENTS.md`/
`CLAUDE.md` at all, the policies alone become the mounted context instead of
being silently dropped. No policies anywhere leaves the mount unchanged —
manigot ships none by default (project/user taste, not a manigot-opinionated
default).
A system-wide meta prompt (from manigot's global `prompts/meta.md` — mounted
read-only into the container at each CLI's global instruction location
`~/.claude/CLAUDE.md` for Claude Code, `~/.config/opencode/AGENTS.md` for
OpenCode, or copied into the host CLI's own global instruction file for
`mg host`) is injected into every session above the agents, skills and this
project context, together with any other `prompts/*.md` files layered after
it. This file still wins on conflict — it is the most
project-specific layer.
Custom agents that must commit (like the built-in developer/reviewer, or
the catalog agent quality, installed via `mg defaults`)
declare `commit: true` in their frontmatter; agents that never commit declare
`commit: false` and get a read-only git mount. The default — no agent named,
file missing, or marker absent/unknown — is a writable git mount, so a
committing agent is never broken by a missing marker.
Agent files also carry a `tier:` marker: `tier: core` for the agents manigot
itself launches by name (analyst, developer, reviewer, chat, git-solver,
prompter — guaranteed present), `tier: catalog` for the rest (absent = catalog).
Core means guaranteed presence, not locked: a `docs/agents/<name>.md` override
still replaces the content. Like `commit:`, it is stripped for OpenCode.
Agent files can also deny specific commands (`deny:` — a command deny-list)
and declare a network isolation level (`network:`); both are designed but not
yet enforced. `docs/agent-template.md` in the manigot checkout is a copy-me
reference agent showing the full frontmatter surface and every guardrail.
Every job-worktree session ends with a host-side sweep-commit of leftover
changes (a `[<id>] chore: commit all` commit), so read-only agents' outputs
(like the analyst's tasks.md) are committed after their session and `mg done`
is never blocked by uncommitted leftovers. The sweep never runs for plain
sessions, `mg host` sessions, or any `--job` resolution that stays on the main
worktree — the flat-scan fallback (a repo with no local branches, or a
non-git project — there is no job worktree to sweep) and a pre-worktree job
(its branch still checked out in the main worktree itself) alike — since the
main project root holds the user's own uncommitted work.
Agent sessions also restrict git to reading history and making commits (the
session git shim): worktree management, branch deletes, resets, checkouts,
pushes, and the other destructive subcommands are refused. The one exception
is @git-solver, the git expert, which gets the full local git toolbox (only
network git — push/fetch/pull/remote — stays refused).
The manigot TUI's job detail view also offers a `t` key that opens the job's
branch diff in tig (`mg diff <job> --tig`) in a tmux split pane / new
terminal, gated on tig being installed on the host, and an `l` key that
tails the job's `session.log` — the verbose raw stream mg-jdi writes each
invocation's output into as it happens, distinct from the log tab's
`run.log` event summary — live in a tmux split pane / new terminal (piped
through `jq` when available on the host, falling back to a plain `tail -f`
otherwise), gated on a session.log existing for the job (created at mg-jdi
run start). Capital `L` tails the same file in a condensed form instead
(`mg logtail`, same gate): reasoning/tool-call events collapsed to short
labels or hidden entirely per a fixed classifier, with anything unrecognized
still shown raw — `l`'s raw view stays reachable at all times, never
replaced.
`mg serve` is the listener: a long-running daemon exposing a control API
over a registry of named project roots (an explicit config file,
`serve.json` in manigot's user config dir — `$MANIGOT_CONFIG_DIR`, else
`$XDG_CONFIG_HOME/manigot`, else `~/.config/manigot` — holding `{"projects":
[{"name": "my-project", "path": "/abs/root"}, ...]}` — `name` is the required,
operator-chosen URL segment the project is served under; no scanning;
change it with `mg serve-projects add/rm` (or `mg serve-project [name]`, a
one-shot shortcut that registers the current directory and suggests its base
name as the project name) — or by editing — and restart), so
any surface — a web UI, a
native GUI, a future CLI — can attach to it as a client from localhost or a
VPS. It binds `127.0.0.1:18080` by default (tokenless —
the machine's own user is the trust boundary); a non-loopback bind REQUIRES a
bearer token (`--token` or `$MG_SERVE_TOKEN`) or the daemon refuses to start,
and TLS is the reverse proxy's job (Caddy/nginx), never the daemon's. The v1
API is read-only (projects, jobs, job files, jdi status + logs, diff, agents,
health, project git status/log); job two added the mutating lifecycle (create
job, edit brief, launch one agent detached, launch mg jdi detached, done,
delete, push, project git fetch/pull/push, prune, orphaned-worktree list + delete)
and a live session-log SSE stream
(`GET .../jobs/<j>/session-log/stream` — the network twin of the TUI's `l`
tail, resumable via `?from=<byte offset>`), with the detached launches
returning 202 and the caller watching the job's session.log. The whole
surface is a new trust boundary: URL segments are never joined into
filesystem paths, credentials are never returned in any response, every
request is audit-logged (never the token), and the git-mutating operations
(create, edit-brief, done, delete, push, project git pull/push,
orphan-delete) serialize per project root via the `serve.ProjectLocks`
pattern — while launch-agent, launch-jdi,
prune, the profile-management routes (`GET/POST /profiles`, `POST
/profiles/{id}/delete`, `GET /providers`, `GET /models`) and the schedule
management routes (`GET/POST /schedule`, `PUT /schedule/{id}`, `POST
/schedule/{id}/delete`, `/enable`, `/disable` — list/inspect/create/edit/
enable/disable/delete of a scheduled routine, definition management only)
— machine-global stores, like the global settings write — and every read
endpoint deliberately do NOT take the lock, so a job launch never waits
behind an unrelated merge.
Two API surfaces make a deliberate, bounded outbound network fetch:
`GET /models` browses the public models.dev catalog, fail-soft (a fetch
failure answers `available: false`, never a 500), so the web UI's add-profile
wizard can offer a provider's known models; and `POST /projects/<p>/git/fetch`
refreshes the project root's remote-tracking refs on demand — a fetch failure
surfaces as a structured error carrying git's own message, never a silent
success — so a commit pushed from another machine shows up as `behind` on the
Git view: the view paints the local status/log read (`GET
/projects/<p>/git/status` is purely local, never a network touch) instantly,
calls this fetch in the background, then re-reads, and the Refresh button
re-checks the remote the same way. A fetch only moves `refs/remotes/*`, never
the checked-out branch or working tree, so the local read stays instant.
The token is provisioned out-of-band: `mg serve-token` generates a fresh one
into the manigot secrets store (`manigot-secrets.json` in the same user
config dir, 0600) as
`MG_SERVE_TOKEN`, read once at daemon startup — the
API itself never issues, creates, or returns one.
Copying text from inside a session uses OSC 52: your terminal emulator must
support it, and tmux needs `set-clipboard on` when the session runs inside
tmux (mg forwards your terminal environment into the container and warns at
session start when it detects tmux would swallow the clipboard writes — see
the manigot README's "Clipboard / copying from agent sessions" section).
One deliberate exception in that forwarding: OpenCode sessions never see
`TMUX`/`TMUX_PANE`, because OpenCode's TMUX-gated tmux DCS-passthrough OSC 52
form is discarded by default tmux config (`allow-passthrough` off) — stripping
`TMUX` makes it emit plain OSC 52, which tmux's `set-clipboard on` handles.
The `shot` tool (`/usr/local/bin/shot`, see the manigot README's PLAYWRIGHT
doc) renders a URL to a PNG + model-free render report. The developer agent
uses it to verify rendered work; read-only agents consume the artifacts and
never run it.
Claude Code respects your host terminal's own color theme automatically;
OpenCode needs an explicit theme setting, which manigot exposes as a global
setting shared across every OpenCode profile (`mg theme <name>`, or the
TUI's settings screen) — see the manigot README's Theme section. This is a
manigot-level setting, not something to configure per-project here.
Keep this file tool-neutral — write it for "the agent", not for one vendor.
-->

The Android app for solyto (app ID `app.solyto`): a free, private, all-in-one
personal management app (todos, contacts, calendar, notes, feeds, finances,
libraries, …). It wraps the solyto SvelteKit web frontend in a Capacitor
WebView and ships as a signed APK on GitHub Releases and via F-Droid.
License: AGPL-3.0.

## Stack
- Backend: not in this repo. The app talks to the separate solyto API
  (`https://api.solyto.app` by default, `http://localhost:8000` in dev, or a
  user-set custom URL on mobile; see `frontend/src/lib/config/platform.ts`)
- Frontend: SvelteKit 2 + Svelte 5 (runes), TypeScript, Tailwind CSS v4, Vite 7,
  built statically with `@sveltejs/adapter-static` (`fallback: 'index.html'`)
- Mobile shell: Capacitor 7 (`@capacitor/android`), Android minSdk 24 /
  target + compile SDK 36, Java `MainActivity` extending `BridgeActivity`
- Database: none in this repo
- Key packages: Tiptap 3 (rich-text notes), ECharts, DOMPurify, marked,
  `@simplewebauthn/browser`, svelte-dnd-action, svelte-gestures,
  `@lucide/svelte`; Vitest 4 + Testing Library + jsdom for tests
- Toolchain: CI uses Node 22 and Java 21 (Temurin); F-Droid builds on Node 20,
  so `npm ci` runs with `--engine-strict=false`

## Architecture
- `frontend/`: **vendored copy** of the canonical web app (sibling repo
  `../app`, or `$APP_SRC`), refreshed by `scripts/vendor.sh` (rsync
  `--delete`). It is committed so CI and F-Droid build it without fetching.
  - `src/routes/`: one route per feature (todos, notes, calendar, contacts,
    finances, libraries/*, check-in, time-tracking, settings, auth/*, admin, share, …)
  - `src/lib/state/*.svelte.ts`: rune-based state classes per domain
  - `src/lib/services/`: `ApiService` (fetch wrapper) and pure logic services
  - `src/lib/helpers/`, `src/lib/components/`, `src/lib/types/`, `src/lib/i18n/` (en, de, fr, es)
  - `src/lib/config/platform.ts`: `PLATFORM` is `mobile` when built with
    `PUBLIC_MOBILE=true`; this switches API URL resolution
  - `tests/`: Vitest projects `unit`, `stores` (`tests/unit/stores`, with
    `storeMocks.ts`), and `components` (jsdom); all run with `TZ=UTC`
- `patch/`: mobile-only overrides that `vendor.sh` copies over the vendored
  frontend (currently `svelte.config.js` → adapter-static). `vendor.sh` also
  adds `@sveltejs/adapter-static` to the vendored `package.json`/lockfile.
- `android/`: Capacitor-generated Gradle project. App-specific code lives in
  `android/app/src/main/java/app/solyto/MainActivity.java` (share-intent →
  `https://my.solyto.app/share?q=…`, edge-to-edge system bar colors on API 35+).
- `capacitor.config.json`: `webDir: frontend/build`, served as
  `https://my.solyto.app` inside the WebView.
- `scripts/`: build, vendor, and release scripts (see Commands).
- `fdroid/app.solyto.yml`: F-Droid metadata. Its prebuild runs
  `scripts/build-fdroid.sh`. Store listing text and screenshots are in `fastlane/metadata/android/`.
- Versioning: root `package.json` `version` is the source of truth.
  `build-fdroid.sh` writes it into `android/app/build.gradle` as `versionName`
  and `versionCode` (`MAJOR*10000 + MINOR*100 + PATCH`, e.g. 1.0.15 → 10015).

## Commands
- `cd frontend && npm test`: run the Vitest suite (`test:watch`, `test:coverage` also available)
- `cd frontend && npm run check`: svelte-check type check
- `cd frontend && npm run lint`: prettier check + eslint (`npm run format` to fix)
- `cd frontend && npm run dev`: Vite dev server on port 5173 (web mode, API at localhost:8000)
- `make build-fdroid`: build the committed frontend with `PUBLIC_MOBILE=true`
  and run `npx cap sync android` (the build CI/F-Droid use)
- `make build`: run `vendor.sh` (needs `../app`) and then `build-fdroid`
- `make sync` / `make open` / `make run`: `npx cap sync|open|run android`
- `cd android && ./gradlew assembleRelease`: release APK (signing via
  `KEYSTORE_PATH`, `STORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` env vars)
- `make clean`: remove `frontend/build`, `frontend/.svelte-kit`, `frontend/node_modules`
- `VERSION=x.y.z make release` / `make rerelease`: maintainer-only, see Hard rules

## Hard rules
- NEVER modify files outside /workspace
- NEVER install packages without asking
- Treat `frontend/` as vendored. The next `vendor.sh` run overwrites any edit
  made there. Fix web-app behavior in the canonical `../app` repo instead, and
  put mobile-only changes in `patch/` (or `vendor.sh`). If an edit inside
  `frontend/` really is needed, flag it explicitly.
- NEVER run `make release` or `make rerelease`, or the scripts behind them. They
  source `.env`, commit, create or delete tags, push to `origin`, and delete GitHub releases.
- NEVER touch signing material or secrets without flagging it: `.env`,
  `keystore.jks`, the `signingConfigs` block, or the `KEYSTORE_*`/`*_PASSWORD` env handling
- Do not hand-edit `versionCode`/`versionName` in `android/app/build.gradle`.
  They come from root `package.json`. Changes to `fdroid/app.solyto.yml` affect
  F-Droid builds, so flag them.
- Keep `build-fdroid.sh` working on Node 20 and offline. F-Droid runs it with no
  network fetch of app source.
- When scope is unclear: ask, don't guess
- Do not refactor things unrelated to the current task
- Do not add abstractions not already present in the codebase