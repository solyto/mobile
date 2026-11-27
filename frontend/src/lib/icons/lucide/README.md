# Lucide icons

Our own copy of the Lucide icons, taken from `@lucide/svelte` 1.59.0
(license: `LICENSE` in this folder).

Rules:

- An icon's name is never renamed or deleted. Check-in trackers store these names.
- An icon's drawing may be replaced by hand.
- No syncing with future Lucide versions.
- New icons may be added by hand.

Custom check-in tracker icons and the icon picker don't import these components. They use:

- `static/icons/lucide-sprite.svg`: every drawing as a `<symbol>`, loaded only when an own tracker's
  icon is shown (the service worker caches it on first use, not on install).
- `picker-data.json`: Lucide's categories and search terms for the picker.

Both are generated from this folder: after replacing or adding an icon, run
`node scripts/lucide-picker-data.ts`. To refresh categories and search terms, pass a Lucide
checkout of the same version: `node scripts/lucide-picker-data.ts <lucide-repo-dir>`.
