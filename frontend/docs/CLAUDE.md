# [Project Name]

<!--
This is your project context, loaded by the agent at the start of every session.
manigot is vendor-agnostic: it runs Claude Code or OpenCode (`mg --profile
claude-pro` vs `mg --profile zai`/`--profile opencode-go`) against the same
project. Your docs/ directory is
mounted at /workspace/.claude for Claude Code and /workspace/.opencode for
OpenCode, and the same global agents are available under @name either way —
custom project agents in docs/agents/ work under both tools too, written in
the built-in format (name:, description:, tools: Read, Grep, ...). To make a
custom agent read-only under OpenCode, add a `permission:` frontmatter block
(see the manigot README's agent section).
Keep this file tool-neutral — write it for "the agent", not for one vendor.
-->

Brief description of what this project does and who it's for.

## Stack
- Backend:
- Frontend:
- Database:
- Key packages:

## Architecture
Describe the structure here — what lives where, what the key concepts are.
The more specific you are about YOUR architecture, the less Claude guesses.

## Commands
- `[test command]` — run tests
- `[build command]` — build
- `[dev command]` — start dev server

## Hard rules
- NEVER modify files outside /workspace
- NEVER run database migrations without showing them first
- NEVER install packages without asking
- NEVER touch [whatever is sensitive in this project] without flagging it
- When scope is unclear: ask, don't guess
- Do not refactor things unrelated to the current task
- Do not add abstractions not already present in the codebase