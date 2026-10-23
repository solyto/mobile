# Brief: 07 Constructor injection for all stores

type: feature
id: argue
branch: feature/argue_07-constructor-injection-for-all-stores
date: 2026-10-13
author: Leander Muskalla

## What

Convert the 26 stores that assign collaborators as field initialisers (`auth = getAuth();`) to the constructor-parameter shape with defaults used by `Todos` and `Finances`. `new X()` keeps working, so no call site changes.

## Why

The standard (`STANDARDS.md` 15.2) names injection as the shape; having two shapes means the next store copies whichever is nearest.

## Out of scope

Any other change to the stores. Removing the module mocks from the store test setup (can follow later).

## Notes

Mechanical; the existing store tests plus `npm run check` are the safety net. Do one store per commit or small batches, keeping `setX()` ordering constraints in mind (`setAuth()` must run first). Rule: 15.2.
