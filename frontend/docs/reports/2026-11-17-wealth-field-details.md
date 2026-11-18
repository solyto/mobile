# Report: details for wealth fields (description and positions)
read: true

Date: 2026-11-17
Scope: dev request "Finances – Details for Investments", options and trade-offs.
Method: read the wealth field model and requests in the API
(`app/Api/Finances/`) and the wealth page in the app
(`src/routes/finances/wealth/+page.svelte`). No code was changed.

**Status: open.** To be revisited after talking to users. No backlog entries
written yet.

---

## 1. The request

> It would be nice to show some details, if you click on the item. For example
> for Depots a second Layer to add detailed fonds or a description for
> contracts.

"Items" here means wealth fields (confirmed), e.g. a depot or a savings or
pension contract. Budget items are not part of this request.

## 2. Current state

- A wealth field only has a `title` (`StoreWealthFieldRequest`,
  `WealthField::$fillable`). Its values live in a dated history
  (`WealthValue`).
- Clicking a wealth field opens the history modal
  (`src/routes/finances/wealth/+page.svelte:164`): rename the field and edit
  its value history. Nothing else.

## 3. Two parts of different size

### 3.1 Description per wealth field (small, clear)

A nullable `description` text on the wealth field (API migration, requests,
resource, docs, tests), and a text area in the history modal (app, i18n in
six locales). Covers "a description for contracts". Could become an api +
app backlog entry pair as soon as it's wanted; no open questions.

### 3.2 Positions inside a wealth field (needs a decision)

E.g. the funds inside a depot. The central question is how a depot relates
to its positions.

#### Option A: positions have their own value history, the depot's value is their sum

Pros:
- One source of truth; depot and positions can't disagree.
- Shows which position drove a change over time.
- A basis for per-position charts later (composition inside a depot).

Cons:
- More data entry: a depot with 5 funds needs 5 values per update instead
  of 1. Users who copy the total from their broker app would find this
  annoying.
- Dates don't line up: positions are updated on different days, so the
  depot's value on a date has to be "each position's latest value as of that
  date", summed. The history list, the wealth total and the composition
  chart all need that logic.
- Migration: existing depots have a history of totals. Either it's kept and
  position-based values start at some date (a break in the data), or it's
  dropped.
- Two modes per field: the value is read-only once a field has positions;
  API and UI need "manual value" vs. "derived from positions", with edge
  cases (deleting the last position, …).
- A fairly large job across api and app.

#### Option B: positions are informational, the depot keeps its own value

Pros:
- Small and low-risk: values, history and charts don't change.
- Matches the wording of the request ("show some details", "a second
  layer").
- No migration of existing data.
- Doesn't block option A: positions could get a value history later.

Cons:
- If positions get an optional amount, it can disagree with the depot's
  total. Could be softened by showing e.g. "positions: 8.200 € of
  10.000 €" without enforcing it.
- No per-position history, so no "which fund performed".

## 4. Recommendation (preliminary)

Option B plus the description from 3.1: each wealth field gets a list of
positions with a name, an optional note (e.g. an ISIN) and possibly an
optional current amount without history, shown as information only. That
covers both examples from the request at a fraction of option A's cost, and
A can build on it later if users want per-position performance.

## 5. Open questions for the user talks

1. Is a description per wealth field enough for contracts, or do they want
   structured fields (e.g. provider, contract number, end date)?
2. For depots: do users want to *see what's in it* (option B) or *track how
   each fund performs* (option A)?
3. Option B only: should a position have an optional amount, or only a name
   and a note? With an amount, how bad is it if the positions don't add up to
   the depot's value?
4. How do users update their depot today: one total from the broker, or per
   fund?
