# Brief: rendering on clipboard

status: done
type: fix
id: store
branch: fix/store_rendering-on-clipboard
date: 2026-08-27
author: Leander Muskalla

## What

Our clipboard functionality works perfectly.
However, the list of available clipboards renders weirdly.
E.g. if I paste something with line breaks, it'll fold it into one line which is hard to recognize.
We don't need any md or otherwise advanced rendering, but please do render new lines.
That will lead to boxes that take up way more vertical space. To tackle this, give the list rendering of clipboards a max. length. After it, just render "...".

## Why

<!-- Why does this need to exist? What problem does it solve for the user? -->

## Out of scope

<!-- What are we explicitly NOT doing in this job? -->

## Notes

<!-- Anything the analyst or developer should know before starting. -->

