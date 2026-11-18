# Backlog: small UI follow-ups from the release review

created: 2026-11-18

## What

Minor UI issues found in the release review after 1.1.3. Each is small and
independent.

1. **Workspace rename fails silently.** `WorkspaceEdit.svelte` `saveTitle`
   ignores the result of `todos.updateWorkspace` (which now returns the real
   success value). On failure the title snaps back without a message. Needs a
   new i18n key (there is no todo workspace update error yet).
2. **Create of games/plants fails silently.** `GameCreate.svelte` /
   `PlantCreate.svelte` show an error when an edit fails, but not when
   creating fails (`PlantCreate.svelte` ~127).
3. **Time-tracking category dropdown never flips up.** `ProjectCreate.svelte`
   ~121-130 places the (up to 160 px) list below the "+" button; near the
   bottom of a mobile sheet it runs off-screen or behind the bottom nav. Save
   also closes the modal whatever create/update returns (from before).
4. **Budget header at 360 px.** `routes/finances/budget/+page.svelte`
   ~145-161: "Total", the `w-40` tag select and the large amount sit in one
   non-wrapping row; with tags present the amount gets squeezed. Suspected,
   check on a phone.
5. **Wealth chart legend resets.** `StackedAreaChart.svelte` recreates the
   chart on every range change, so hidden series come back.
6. **Stale contact photo.** `Contacts.svelte.ts:155` merges new photos with
   `Object.assign` but never removes old ones; a photo removed elsewhere stays
   visible for the session. A photo fetch started by `update()` can also
   overwrite a photo the user uploads right after (narrow race).
7. **Link categories panel on mobile.** `CategoryNavigationMobile.svelte`
   doesn't close on Escape, has no dialog role/focus handling, and the shared
   `HamburgerButton` has no `aria-label`.

## Suggestion

Fix individually; 1 and 2 are the most user-visible. Add a store or
component test where the change touches state (1, 2, 6).
