# Brief: reload after time away

status: open
type: feature
id: cover
branch: feature/cover_reload-after-time-away
date: 2026-08-19
author: Leander Muskalla

## What

Previously we had tried to fix a bug where the profile image didn't load. Whatever we did, it wasn't the whole answer.
What I discovered now is that the issue is somewhere deeper. There seems to be the possibility to have the app open, go away, re-open later (maybe even a few days) and the app shows/loads up fine, but the profile image might not load and when I want to add entries (e.g. in the notes section), nothing happens.
I expect this is a stale state where theoretically we had been logged in and had received a valid token, but then that went stale and when we come back without a hard refresh on the page, we're somewhere in between.
Because: when I reload the whole page, therefore reload the whole JS setup, everything is fine after that.
Any ideas on how to solve this cleanly?
Many people have solyto permanently open. So this is a common scenario.
Please also check if our fix to the profile image was therefore unnecessary.

## Why

<!-- Why does this need to exist? What problem does it solve for the user? -->

## Out of scope

<!-- What are we explicitly NOT doing in this job? -->

## Notes

<!-- Anything the analyst or developer should know before starting. -->
