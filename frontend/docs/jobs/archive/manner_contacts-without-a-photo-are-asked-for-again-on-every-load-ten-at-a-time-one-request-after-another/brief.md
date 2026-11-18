# Brief: contacts without a photo are asked for again on every load, ten at a time, one request after another

type: feature
id: manner
branch: feature/manner_contacts-without-a-photo-are-asked-for-again-on-every-load-ten-at-a-time-one-request-after-another
date: 2026-11-16
author: Leander Muskalla

Source report: `docs/reports/2026-11-16-contact-photos-serial-refetch.md`

`/contacts` page (`src/routes/contacts/+page.svelte`) and
`src/lib/components/contacts/views/ListView.svelte`.
Method: read the store, the page, the list view and `tests/unit/stores/Contacts.test.ts`
at `ee92baf`. No code was changed. Nothing was measured against a real API. The
backend is in a separate repo, so the cost of `/address-books/contacts/photos` per
contact (for example a CardDAV read per contact) is **not verified**.

**Overall: a clear performance win on `/contacts`, growing with the address book.**
Most contacts have no photo, and the store never remembers that. So every visit to
`/contacts` and every save, delete or create sends the whole photo-less part of the
address book back to the server, in serial batches of 10.

---

## 1. Finding: misses are never cached (verified in code)

`loadContactPhotos()` (lines 120-141) picks the contacts to ask for like this:

```ts
const contactsToFetch = this.contacts.filter((c) => !this.contactPhotos[c.uri]);
```

Only contacts that **got** a photo end up in `contactPhotos`. A contact without a
photo is never written to the map, so it passes this filter every time.

`loadContactPhotos()` runs at the end of every `load()` (line 118), and `load()` runs:

- on every visit to `/contacts` (`+page.svelte:19`, in `onMount`). The store lives
  in the root layout context, so it survives navigation, but the misses do not;
- after every `create()`, `update()` and `delete()` of a contact (lines 226, 236, 253).

So with 500 contacts of which 50 have a photo, every one of these events sends
**45 POST requests** for the 450 photo-less contacts and gets nothing back. Saving
one phone number on one contact costs 45 extra round trips.

## 2. Finding: the batches run one after another (verified in code)

The loop `await`s each batch of 10 before it starts the next one (line 131). On the
first load of a 500-contact book that is 50 serial round trips. At about 150 ms per
request on mobile, avatars keep appearing for 7 seconds or more, from top to bottom.

Each batch also replaces the whole map:

```ts
this.contactPhotos = { ...this.contactPhotos, ...res.data };
```

The values are base64 data URLs. Copying the map is O(n) per batch (so O(n²) over the
run), and replacing the `$state` object invalidates every `contacts.contactPhotos[...]`
read in `ListView.svelte`. Every avatar `{#if}` in the list runs again once per batch,
not only the 10 that changed. This is smaller than findings 1 and 2, but it is free to fix.

## 3. Side finding: overlapping runs request the same photos twice (verified in code, not reproduced)

`contactsToFetch` is computed once, when the run starts. If `load()` is called again
while a run is still going (save a contact during the first load, or leave and come
back to `/contacts`), a second loop starts with the same list. Both loops then request
the same batches. Nothing stops this. `contactPhotosLoaded` is set by whichever loop
finishes first.

## 4. Side finding: `revokeObjectURL` on data URLs does nothing

`ListView.svelte:25-27` calls `URL.revokeObjectURL()` on every value of `contactPhotos`
in `onDestroy`. The values are `data:` URLs (from the API and from the `FileReader` in
`updateContactPhoto()`), not `blob:` URLs, so this is a no-op. If the photos are ever
moved to `blob:` URLs, this code would break them: the store keeps the map across
navigation, but the URLs would already be revoked. Out of scope here, but worth
knowing before anyone changes the photo format.

## 5. Suggestion

All changes are in `Contacts.svelte.ts`. No new dependency and no API change needed.

1. **Remember misses.** After each batch, mark every requested `uri` as checked, also
   the ones missing from `res.data`. For example, keep a plain `Set<string>` of
   checked URIs (not `$state`, nothing renders it) and filter on
   `!this.checkedPhotoUris.has(c.uri)`. On `update()` of a contact, delete its URI from
   the set so a photo changed on another device (CardDAV sync) is still picked up.
   This alone turns the 45 requests per save from section 1 into 0 or 1.
2. **Run the batches in parallel with a small limit**, for example 3 or 4 requests in
   flight, instead of strictly one after another. Check with the backend owner first
   how expensive one batch is on the server side. A bigger `batchSize` is an
   alternative if the server is happy with it.
3. **Write results in place**, `this.contactPhotos[uri] = url` per entry, instead of
   spreading the whole map. The `$state` proxy then only re-runs the avatars that
   changed.
4. **Do not start a second run while one is going.** Keep the running promise in a
   field and return it if `loadContactPhotos()` is called again. Then start a new run
   only for the contacts that are still unchecked.

Tests to add in `tests/unit/stores/Contacts.test.ts` (store project, mocked
`ApiService`):

- a contact missing from the response is not requested again on the next
  `loadContactPhotos()`;
- `update()` makes that contact's photo get requested again;
- two `loadContactPhotos()` calls at once send each URI only once;
- with 25 contacts, 3 batches are sent (the batching contract stays the same).

## 6. Not checked

- How the backend serves `/address-books/contacts/photos` (cost per contact, whether
  it already caches) and whether it would accept parallel requests or bigger batches.
- Real numbers on a large address book. The request counts above come from the code,
  not from a measured run.
- Whether `contactsAZ` (26 filter + sort passes over all contacts on every change) is
  noticeable on large books. It looked fine on reading and was left out of this report.
