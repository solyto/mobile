# Brief: 29 Setup health check accepts the envelope

type: feature
id: garden
branch: feature/garden_29-setup-health-check-accepts-the-envelope
date: 2026-10-15
author: Leander Muskalla

## What

`src/routes/setup/+page.svelte` (`saveSelfhosted`) reads `app` and `version` from the top level of the `GET health` body. The API (`solyto/api` `637f2ad`) now returns them inside the `ApiResponse` envelope (`data.app`, `data.version`) and keeps the top-level copies only as a pinned legacy contract. Accept either shape.

## Why

The top-level keys exist only so old builds can still add a self-hosted server. New builds should read the envelope like every other response.

## Out of scope

Anything else in setup.

## Notes

Low priority: nothing is broken today. The check stays the one accepted direct `fetch` (rule 15.3). Safety: `check`, plus a manual self-hosted setup against a local API.
