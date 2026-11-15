# Verdict: recommendation / releases modal broken

id: border
reviewer: reviewer
date: 2026-11-10

## Review

TASK-1: PASS
notes: `Releases.svelte:54` drops `transparent={true}` and passes `rounded="2xl" p="8"`, the same as `CreateModal`/`LibrarySearchModal`. The inner wrapper is unchanged, which is allowed.

TASK-2: PASS
notes: `Recommender.svelte:86` gets the same change. The `md:h-92 md:w-112` content size is kept.

TASK-3: PASS
notes: `PopupContentModal.svelte` removes the prop. The title always gets `top-[-20px] left-12`. The panel always gets `max-md:h-[calc(100dvh-4rem)] bg-c-bg-modal not-dark:border-1 shadow-md dark:shadow-s-dark-shadow`. That matches the old `transparent = false` output exactly. No caller passes `transparent` anymore (I grepped `src`). `ContentModal` passes props through with `{...props}`, and `BottomSheetModal` never read the prop, so mobile is unaffected and nothing breaks at the type level.

Scope: the diff only touches the three planned files and the job docs. There are no unplanned changes.

Not verified: the developer could not run `npm run check`, lint or a render because `node_modules` is missing. The change is a prop removal, so the risk is low. A visual check of both modals on desktop in light and dark theme is still advisable before release, but it does not block the merge.

## Security

none

## Overall

APPROVED
