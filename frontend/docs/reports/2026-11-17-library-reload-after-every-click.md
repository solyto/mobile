# Report: one star click in a library re-downloads the whole library, in up to three serial requests
read: true

Date: 2026-11-17
Scope: `load()` and the mutation methods of the eight library stores
(`src/lib/state/{Book,Movie,Music,Game,Recipe,Plant,Quote,Link}Library.svelte.ts`),
with `LinkLibrary` as the worked example (`LinkEntry.svelte`, `dragToCategory()`).
Method: read the stores, `ApiService.update()`, the library route layouts and
`tests/unit/stores/LibraryStores.test.ts` at `cefc260`. No code was changed. Nothing
was measured against a real API. Payload sizes and server cost of the list endpoints
are **not verified** (the backend is in a separate repo).

**Overall: a clear latency win on every library page, growing with the library.** Small
one-field edits (star, rating, drag to category) wait for a full list download plus a
second list download before the UI shows the change.

---

## 1. Finding: every mutation reloads everything (verified in code)

Every `create` / `update` / `delete` / `updateRating` / `dragToCategory` in all eight
library stores ends with `if (res) await this.load();` (4-5 call sites per store).
`ApiService.update()` returns only `res.ok` (`ApiService.ts:266-276`), so whatever the
server sends back is thrown away and the store has no choice but to refetch.

Worked example, starring a link (`LinkEntry.svelte:25-30`):

1. `PUT /libraries/links/{id}` with `{ is_favorite }`
2. `GET /libraries/links`, the **whole** library
3. `GET /libraries/links/categories`, started only after 2 has finished
   (`LinkLibrary.load()`, line 57: `await this.loadCategories()`)
4. `loadCategories()` recounts every category with
   `this.entries.filter(...)` per category: O(categories × links) on every click

The star icon reads `entry.is_favorite`, so it flips only after **three serial round
trips**. At ~150 ms per request on mobile that is ~450 ms with the loading bar running,
for a value the client already knew when the user clicked.

Same shape elsewhere:

| Store | Requests in `load()` | Serial? |
| --- | --- | --- |
| Book, Movie, Game | list → genres | yes (`await this.loadGenres()` inside `load()`) |
| Music | list → genres → integrations (integrations once per store instance) | yes |
| Link | list → categories | yes |
| Recipe, Plant, Quote | list | — |

So a rating change in the book detail modal (`DetailModal.svelte:26` →
`BookLibrary.updateRating()`) is PUT + full book list + genre list, one after another.

## 2. Finding: overlapping clicks can show stale data (inferred, not reproduced)

Two quick stars on different links start two independent `load()`s. Nothing orders
their responses; if the first GET comes back after the second, `this.entries` is
overwritten with the older list and the second star appears to be undone until the
next reload. Plausible on a flaky mobile connection; not reproduced.

## 3. Suggestion

Smallest change first, each step on its own is worth it:

1. **Run the two `load()` requests in parallel.** In Book/Movie/Game/Music/Link:
   `await Promise.all([listRequest, this.loadGenres()])` (or `loadCategories()`), then
   assign. Same pattern `Todos.updateCategory()` already uses
   (`Promise.all([this.loadCategories(), this.loadWorkspaces()])`). Cuts a round trip
   from every page load **and** every mutation. `LinkLibrary.loadCategories()` must then
   compute counts after both have arrived, not inside the categories fetch.
2. **Patch locally for single-field edits where the client knows the new value.**
   `LinkLibrary.update()` for `is_favorite`, `dragToCategory()` (category object is in
   `this.categories`) and `updateRating()` in the five rated stores: on `ok`, replace
   the one entry (`this.entries = this.entries.map(e => e.id === entry.id ? { ...e, ...change } : e)`),
   then `reapplyFilter()`, and recount categories from memory. No GET at all. This also
   removes the race in §2.
3. **Leave full reloads for create/delete and the edit form** until the backend
   contract is checked: if `PUT` returns the updated entity, `ApiService.update()`
   could return it and `update()` could swap that one entry in too. Needs a look at
   the API repo first; out of scope here.

Keep `load()` as fetch → convert → assign (STANDARDS 12.2); the local patch belongs in
the mutation method, not in `load()`.

## 4. Tests

`LibraryStores.test.ts` already mocks `api.list`. Add, per changed store:

- `load()` issues both list requests before either resolves (parallel).
- After a favorite / rating / drag update, `api.list` is **not** called again and the
  entry, `filteredEntries` and `getCategoryCount()` reflect the change.
- A failed update (`api.update` → `false`) leaves the entry untouched.

## 5. Risk

Low for step 1. Step 2 drifts from the server only if the server rewrites the
field it was sent (e.g. clamps a rating); worth a one-line check in the API repo
before shipping. `updated_at` stays stale locally; the library UI does not sort or
display by it on these views (not exhaustively checked).
