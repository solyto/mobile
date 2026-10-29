# Brief: libraries: changing a rating resets the list

type: feature
id: line
branch: feature/line_libraries-changing-a-rating-resets-the-list
date: 2026-10-29
author: Leander Muskalla

## What

When I am in my book library (probably the exact same for other libraries), search for a book, open a book and change the rating (from the view modal, not the edit modal, but probably the same), the filter resets and the whole list shows again. Probably because we're reloading the whole list from the API. However, if we do that, we should re-apply the filter again, so your view doesn't completely change. It would be best if the list doesn't shortly flicker to ALL entries and then BACK to filtered entries. Find a good way to do that.
Also check if other edits (besides rating) do the same thing. They most likely do.

## Why

<!-- Why does this need to exist? What problem does it solve for the user? -->

## Out of scope

<!-- What are we explicitly NOT doing in this job? -->

## Notes

<!-- Anything the analyst or developer should know before starting. -->
