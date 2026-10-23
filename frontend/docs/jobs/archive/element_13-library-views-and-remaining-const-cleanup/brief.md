# Brief: 13 Library views and remaining @const cleanup

type: feature
id: element
branch: feature/element_13-library-views-and-remaining-const-cleanup
date: 2026-10-13
author: Leander Muskalla

## What

- `libraries/shared/SpineView.svelte` and `LibrarySearchModal.svelte`: the stacks of `{@const}` at the top of their `{#each}` bodies become child components.
- Remove the remaining `{@const}` uses repo-wide (the `{@const Icon = x.icon}` form becomes `<x.icon />`), keeping only the narrowing form allowed by rule 1.5.
- Strip narrating comments from the files listed in `STANDARDS_BACKLOG.md` (audits section).

## Why

These are the last places where a component's script is written inside its template, and the last cluster of comment-heavy AI code.

## Out of scope

Visual changes to the shelf or search modal.

## Notes

No unit seam; `check`, `lint` and a manual pass. Rules: 1.5, 10.1.
