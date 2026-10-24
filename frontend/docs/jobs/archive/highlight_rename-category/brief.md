# Brief: rename category

status: open
type: feature
id: highlight
branch: feature/highlight_rename-category
date: 2026-08-13
author: Leander Muskalla

## What

Editability of category names.
We should find a way to offer the user a way to edit the name of a category. Probably, as it is now, in the settings todo section.
Stay in the design language we use elsewhere.
The API endpoint is PUT /api/v1/todos/categories/{category} with title in the body.

## Why

Currently users cannot edit any categories. They can delete and recreate ones, but that also gets rid of all todo associations.

## Out of scope

<!-- What are we explicitly NOT doing in this job? -->

## Notes

<!-- Anything the analyst or developer should know before starting. -->
