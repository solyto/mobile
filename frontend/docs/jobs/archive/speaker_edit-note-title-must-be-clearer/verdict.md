# Verdict: edit note title must be clearer

id: speaker
reviewer: reviewer
date: 2026-10-29

## Review

TASK-1: PASS
notes: `src/lib/components/notes/NoteHeader.svelte` copies the pattern from
`todos/props/Title.svelte` exactly. It adds a `MovableHoverBox` import, the
`showExplanationBox`/`explanationBoxX`/`explanationBoxY` state, the
`setExplanationBoxPosition` function, and the mouseover/mouseout/focus/blur/mousemove
handlers on the title button. It also resets `showExplanationBox = false` in
`toggleChangeTitle`. It uses the existing key `layout.double_click_to_edit`, which
is present in all locales and in `types/translation.ts`. The inline
`onblur` arrow on the button doesn't conflict with the script's `onblur`
function, which the edit `<input>` still uses. The box uses `position: fixed`,
so it doesn't change the flex layout. The journal title is correctly left without a hint.

Scope: the only source change is NoteHeader.svelte, which matches implementation.md.
The other commits on the branch only touch job docs (brief/tasks/implementation).

Not verified: `npm run check` / `npm run lint` could not be run here
(`node_modules` is not installed). The change is a direct copy of code that already
type-checks in Title.svelte, so the risk is low.

## Security

none

## Overall

APPROVED
