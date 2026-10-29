# solyto frontend — coding standards (DRAFT, in progress)

Status: working draft. Built from concrete examples of code the repo owner is
unhappy with, one at a time. Every rule here was extracted from a real case in
this repo, not from a generic style guide. Rules are written to be checkable:
a reviewer (human or agent) must be able to say "this line violates rule X".
How this document is built: `docs/STANDARDS_WORKFLOW.md`.

Structure:

- **Rules** — numbered, grouped by topic. Each has: the rule, why, a bad/good
  example from this repo where possible, and how to check it.
- **Decisions** — choices the owner made that are not obvious from the code.
- **Open questions** — things waiting for the owner's answer.

Concrete cleanups found while writing the rules are tracked separately as
backlog entries in `docs/backlog/`, so this file stays a description of the
target and never a todo list.

## The recurring themes

After a dozen examples, AI-written code in this repo goes wrong in the same
handful of ways. If you remember nothing else:

1. **Expressions in markup that spill over several lines.** Keep attribute
   expressions short; logic goes to the script (section 1).
2. **`$effect` used to synchronise state.** Writes to state inside an effect,
   shadow copies to detect changes, watchers for transitions the store itself
   causes. It is a `$derived`, an event handler, or a store method (section 5).
3. **Leaf components that know too much.** Reading auth, settings, stores to
   decide their own rendering. The parent passes props (sections 3, 6).
4. **Reinventing instead of reusing.** Raw inputs and buttons next to
   `forms/` and `ui/`; private key listeners next to `KeyManager`; a
   module-level `$state` next to 37 context stores; the same twelve lines
   pasted into three files (sections 2, 7, 9, 11).
5. **Comments narrating code.** The default is none (section 10).
6. **Logic inline that belongs in a service.** Parsers, serialisers, payload
   conversion, grouping, written inside a component or a `load()` method
   (sections 12, 13).

---

## 1. Markup expressions

### 1.1 An attribute expression is one readable line

A `{…}` expression inside an attribute (`class`, `style`, a prop) is written
on one line and reads at a glance. If it needs to be broken across lines to
be readable, or a reader has to scan back and forth to find where it ends,
the expression is too complex for markup: move the logic into the script as
a named function or `$derived`, and leave a short call or name in the
attribute.

There is no formatter in this repository (Prettier was removed on
2026-10-12 because it rewrote deliberate formatting). The author formats by
hand, and the shapes in this section are the reference. Line length is not
a hard limit; readability is.

Bad (`calendars/views/week/Day.svelte:226-229`, AI-written and then
machine-folded):

```svelte
style="border-color: {item.calendar_color ??
	'var(--color-c-neutral-2)'}; background-color: {item.calendar_color
	? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))`
	: ''}; top: {getTop(item)}; height: {getHeight(item)};"
```

Good:

```svelte
style="
	border-color: {eventBorderColor(item)};
	background-color: {eventBackgroundColor(item)};
	top: {getTop(item)};
	height: {getHeight(item)};
"
```

with the `??` / ternary living inside the two helper functions.

Check: any `{` inside an attribute whose matching `}` is on a different line.

### 1.2 Conditionals in markup are allowed, but only short ones

Short ternaries are fine when they are necessary (style values, class names
that `class:` cannot express) and the whole attribute stays on one line. They
are never nested, never chained, never longer than one line.

### 1.3 Classes: `class:` directive first, then the array form

Order of preference for a conditional class:

1. `class:name={cond}` — the repo idiom (571 uses). Works with `dark:` and `!`
   prefixes (`class:dark:bg-s-dark-2`, `class:!border-l-0`).
2. The Svelte 5 array form when `class:` cannot express the name, e.g. an
   opacity modifier (`class:bg-red-300/20` does not compile):
   ```svelte
   class={['relative grid', isMobile ? 'row-span-full' : 'h-full w-full', isDropTargetColumn && 'bg-d-lightblue/40']}
   ```
   When it gets long, write one entry per line. Keep it flat: no nested
   ternaries inside the array.
3. A plain ternary inside `class="…"` only if it fits on one line (1.1).

Bad (`Day.svelte:204-208`):

```svelte
class="group relative border-t-1 border-c-neutral-1 dark:border-s-dark {offHour
	? 'bg-c-neutral dark:bg-s-dark-2'
	: ''}"
```

Good:

```svelte
class="group relative border-t-1 border-c-neutral-1 dark:border-s-dark"
class:bg-c-neutral={isOffHour(hour)}
class:dark:bg-s-dark-2={isOffHour(hour)}
```

### 1.4 `style` attributes: one declaration per line when there is more than one dynamic value

```svelte
style="
	border-color: {eventBorderColor(item)};
	background-color: {eventBackgroundColor(item)};
"
```

Each value is a short interpolation (a name or a call). Reference:
`Day.svelte:186-189`.

### 1.5 `{@const}` only names what an `{#if}` just narrowed

A value needed in markup comes from one of:

- a script function called inline (`{isOffHour(hour)}`),
- a `$derived` in the script,
- a prop of a child component.

The one allowed use of `{@const}`: giving a non-null name to a value that
the enclosing `{#if}` narrowed, when that name is read more than once in the
block. The right-hand side is a bare member expression, never a call or an
operator.

```svelte
{#if todos.editingTodo}
	{@const todo = todos.editingTodo}
	<Title {todo} />
	<Status {todo} … />
```

(`todos/TodoEditModal.svelte:61`, twelve reads below it.) Nothing in the
script can do this, because the narrowing belongs to the `{#if}`.

Not allowed: a single-use `@const` (`Day.svelte:203`, a function call
inlined into the template); any `@const` that computes something; a stack
of them at the top of an `{#each}` body (`libraries/shared/SpineView.svelte:133-139`,
seven in a row, which is a child component's script written in the
template); the Svelte 4 `{@const Icon = x.icon}` trick, since Svelte 5
renders `<x.icon />` directly. Two or more `@const`s in one block always
mean a child component.

Bad:

```svelte
{#each hours as hour (hour)}
	{@const offHour = isMobile && (parseInt(hour) < 6 || parseInt(hour) >= 22)}
	<div class:bg-c-neutral={offHour}>
```

Good:

```ts
function isOffHour(hour: string): boolean {
	return isMobile && (parseInt(hour) < 6 || parseInt(hour) >= 22);
}
```

```svelte
{#each hours as hour (hour)}
	<div class:bg-c-neutral={isOffHour(hour)}>
```

Check: every hit of `grep -rn '{@const' src` has a bare member expression on
the right and sits directly under an `{#if}` on the same value. One use
today, the valid one above.

### 1.6 Repeated markup becomes a `{#snippet}` or a component

Two blocks in the same file with the same element, handlers and classes are
one snippet. Two across files are one component.

Example: `Day.svelte` renders the all-day event button (182-197) and the hourly
event button (221-237) with identical handlers, style and inner markup; the
only differences are three classes. One snippet with the varying classes as
parameters.

### 1.7 A viewport-fixed overlay is rendered once, at the view level

Reference case: `calendars/dnd/CalendarDragGhost.svelte`, a
`position: fixed` drag ghost mounted inside every `Day` column (7 in week
view, 42 in month view). Its only prop, `sourceDateSlug`, exists so that all
but one instance render nothing.

A prop whose sole purpose is to pick which of N copies renders is the tell:
the element belongs once in the parent view (`WeekView`, `MonthView`), with no
prop, reading the drag state directly.

### 1.8 No dead attributes

`data-calendar-drag-ghost` (`CalendarDragGhost.svelte:9`) is read by
nothing. A `data-*` marker, an `id`, or a class that no CSS or script refers
to is removed. Check: grep the attribute's name across `src/`; one hit means
dead.

### 1.9 Narrow once, then read

```svelte
<!-- Bad — four reads to narrow, then six more dereferences in the body -->
{#if calendarDrag.active && calendarDrag.event && calendarDrag.ghost && calendarDrag.sourceDateSlug === sourceDateSlug}
	<div style="left: {calendarDrag.ghost.x}px; … {calendarDrag.event.calendar_color …}">
		{calendarDrag.event.title}
```

A condition with three or more `&&` terms over the same object is a named
boolean or a store getter (`calendarDrag.isGhostVisible`). The fields the
body needs are then read through short helpers (`ghostStyle()`), not by
re-walking the object in every attribute.

### 1.10 Formatting by hand

With no formatter, these are the conventions the hand-written code follows
(measured 2026-10-12 across `src/lib`); new code matches them:

- Tabs for indentation, four wide. No space-indented lines exist.
- Single quotes in TypeScript and in Svelte script blocks; double quotes
  only for HTML attribute values.
- Semicolons after every statement.
- No trailing comma after the last element of an object, array or
  parameter list.
- One blank line between top-level declarations; none at the start or end
  of a block.
- A long call or signature breaks one argument per line, closing bracket on
  its own line (the `Todos.svelte.ts` constructor is the reference). A long
  `style` attribute breaks one declaration per line (1.4). Related data
  rows that read as a table may stay compact on one line each
  (`i18n/en.ts`, the check-in labels), even when long.
- Tailwind classes have no enforced order; keep the order you find in the
  nearest hand-written component (layout, spacing, colour, state variants).

Check: `npm run lint`. The trailing-comma and semicolon rules are enforced
by ESLint (`comma-dangle: ['error', 'never']`, 64b4069, and
`semi: ['error', 'always']` in `eslint.config.js`); the others are by hand.

---

## 2. Repetition

### 2.1 A CSS value expression that appears in more than one file is a helper

Example: `color-mix(in srgb, ${color} 25%, var(--color-c-bg-elevated))` is
copy-pasted in 10 places across 8 calendar files. Two of them
(`calendars/NavigationEntry.svelte:20`, `calendars/views/month/Entry.svelte:74`)
already wrap it in a function. It belongs once, in `helpers/ColorHelper.ts`
next to `lightenColor`.

### 2.2 Domain constants and lookups live in one place

- "Off hours are before 6 and from 22" is written out five times in three
  files (`week/Day.svelte:203`, `week/MobileWeekView.svelte:15,88`,
  `day/MobileDayView.svelte:14,45`). One `isOffHour(hour)` in a helper.
- The 24-entry `hours` array (`Array.from({ length: 24 })…padStart(2, '0')`)
  is copy-pasted in six files (five calendar views and `forms/TimePicker`).
  One `getHoursOfDay()` in `DateHelper`.
- A CSS length used three times in one file (`calc((100vw - 2rem) / 3)` in
  `MobileWeekView.svelte:55,79`) is a `const`.

### 2.3 Use the data you already have

`getCalendarWeek()` returns days with a `weekday` field, and
`WeekView.svelte:42` reads `ts.get.calendar.weekdays_short[day.weekday]`.
`MobileWeekView.svelte:40-45` ignores that field and recomputes the weekday
from the date, needing an `as keyof typeof …` cast to make it type-check.
A cast like that usually means the data shape is being fought instead of
used; look at what the helper already returns.

### 2.4 Browser and platform behaviour is written once, on first occurrence

Reference case: commit `9cb1964`, which pasted the same `visualViewport`
keyboard-height block into `BottomSheetModal.svelte` and
`BottomSheetConfirmationModal.svelte`; a third copy already existed in
`notes/editor/TipTapEditor.svelte:130-134`.

Whether a piece of code will be needed elsewhere is decided by what kind of
problem it solves, not by counting copies. Anything that observes the
browser or the device (viewport and keyboard size, scroll position, focus,
click-outside, portals, online/visibility, media queries) is a cross-cutting
concern by nature and is written once, the first time, in one of the two
homes the repo already has:

- a fact about the environment: a getter on `state/Viewpoint.svelte.ts`
  (already owns `width`, `height`, `isMobile`); one listener for the app,
  read as `viewPoint.keyboardHeight`;
- a behaviour attached to an element: a Svelte action in `src/lib/helpers/`
  (`use:clickOutside` in `ClickHelper.ts`, `use:portalToBody` in
  `PortalHelper.ts`).

The old `BEST_PRACTICES.md` threshold of "three or more times" does not
apply to this category. If the same block is being written into two files
in one change, that is already the signal.

---

## 3. Reactivity in components

Reference case: `calendars/DayLifeMarks.svelte` as introduced in commit
`f2b818d` (AI-written, 8 `$derived` to render two icons) versus its hand
rewrite `calendars/CalendarMarks.svelte` (zero `$derived`). Same behaviour.

### 3.1 `$derived` requires a reactive input that changes during the component's lifetime

Before writing `$derived`, answer two questions. If either answer is no, it
is not a `$derived`:

1. Does the input change while this component instance is alive?
   A prop that is fixed per instance (a day inside a keyed `{#each}`) is a
   plain `let`, computed once:
   ```ts
   let dateUrlFormat = getUrlFormat(date);
   ```
2. Is there a reactive read at all? `$derived(getUrlFormat(new Date()))` has
   none; it never recomputes and is pure noise.

Bad (`DayLifeMarks.svelte`, f2b818d):

```ts
const dateKey = $derived(getUrlFormat(date));
const todayKey = $derived(getUrlFormat(new Date()));
const reachable = $derived(dateKey <= todayKey);
```

Good (`CalendarMarks.svelte`):

```ts
let dateUrlFormat = getUrlFormat(date);
```
```svelte
{#if !isDateInTheFuture(date) && (showJournal || showCheckIn)}
```

### 3.2 A value read once in markup is inlined, not named

Reading a store property directly in markup is already reactive; wrapping it
in a named `$derived` adds a line and a name for nothing.

Bad:

```ts
const hasJournal = $derived(calendars.journalMarks.includes(dateKey));
```
```svelte
<IconNotebook class="{iconClass} {hasJournal ? 'text-c-action' : '…'}" />
```

Good:

```svelte
<IconNotebook class={calendars.journalMarks.includes(dateUrlFormat) ? 'text-c-action' : INACTIVE} />
```

If the expression needs a name to be readable, the name is a helper function
(`isDateInTheFuture(date)`), not a reactive variable.

Heuristic: a script with more `$derived`/`$state` lines than the markup has
dynamic spots has swallowed something. Six components currently have five or
more `$derived` (`week/Day.svelte` has 9); see parking lot.

### 3.3 State lives in the parent; leaf components are dumb

A leaf component receives everything it needs as props and renders them. It
does not import stores to decide whether or how it renders. Its contract is
"given these inputs, show this"; what the inputs depend on (settings, auth,
today's date, other stores) is not its concern.

- If a child needs a value the parent has, the parent passes it.
- If several children need the same value, the parent computes it once and
  passes it to all of them.
- A child importing `getAuth()` or reading `user.settings` is the signal that
  state was pushed one level too deep.

Where the line is: a leaf may read a store for the *data it displays*
(`calendars.journalMarks.includes(slug)` to pick the icon colour in
`CalendarMarks`). It never reads a store to decide *whether* or *how* it
renders: visibility, configuration and mode always arrive as props, and
`auth`/settings are never read in a leaf. The direction matters more than
perfection; when in doubt, pass the prop.

Why: a stateful prop in the parent is one attribute. Letting the child work
it out costs imports, derived state, and a hidden coupling that makes the
child impossible to reuse or test in isolation.

Bad: three `$derived` over `auth.user?.settings?.*` inside the leaf, plus a
`$derived` comparing the date to today, to decide whether to render.

Good: `Calendars.journalMarksEnabled` / `checkInMarksEnabled` on the store
(computing `journal_enabled && journal_calendar_mark` once), and

```svelte
<CalendarMarks date={day.date} showJournal={calendars.journalMarksEnabled} showCheckIn={calendars.checkInMarksEnabled} />
```

### 3.4 Props describe values, not modes

`size={14}` rather than `compact={true}` with a class lookup behind it. A mode
flag forces every consumer to know what the mode means; a value does not.

### 3.5 Repeated class strings in one file become a `const`

When the same class string appears in two attributes (the inactive icon
colour in `CalendarMarks`), name it once in the script:

```ts
const INACTIVE = 'text-c-neutral-4 dark:text-c-neutral-6';
```

This also keeps the ternary on one line (rule 1.1).

### 3.6 Only rendered state is `$state`

A value is `$state` when a change to it must update markup. Bookkeeping
(handler ids, a "last seen id", timers, flags only read inside functions) is
a plain `let`. Making it reactive adds nothing and, inside an effect, is what
turns a side effect into a loop (5.3).

### 3.7 Do not copy store data into local state to edit it

`let title = $state(''); title = todos.editingTodo.title` creates a second
source of truth that then needs syncing (an effect, a guard, a reset). Either
render the store value and write changes back through the store method, or
let the one component that owns the input (`todos/props/Title.svelte`) hold
the draft until save.

---

## 4. Elements and handlers

### 4.1 Native `<button>` with a named handler

No `<span role="button" tabindex="…">`. No inline arrow that only calls a
named function; pass the function.

Bad:

```svelte
<span role="button" tabindex="-1" onclick={(e: MouseEvent) => { e.stopPropagation(); openJournal(); }}>
```

Good:

```svelte
<button tabindex="-1" onclick={openJournal}>
```

---

## 5. `$effect`

Reference case: `calendars/ChooseRecurrenceRule.svelte`, two effects, both
wrong, one of them losing data.

### 5.1 Never use `$effect` to synchronise state

If the body of an effect assigns to a `$state` variable or a bindable prop,
it is the wrong tool. Svelte's own guidance: values computed from other state
are `$derived`; updates caused by the user happen in the event handler.

Why this is not a style point: an effect that writes state runs on mount and
on every dependency change, with no way to tell "the user did something" from
"a prop arrived".

- `ChooseRecurrenceRule.svelte:108-112` resets all weekday checkboxes whenever
  `startDate` changes, wiping the user's selection.
- `ChooseRecurrenceRule.svelte:156-158` re-serialises the bound rule on mount
  through a parser that knows only `FREQ`/`BYDAY`/`BYSETPOS`. An
  `INTERVAL=2` or `UNTIL=` on an existing event is dropped before the user
  touches anything.

Replace with:

- a `$derived` for "chosen weekdays, or the start weekday if none chosen";
- a service `build(selection, startDate)` called by the parent on submit.

### 5.2 What `$effect` is for

Talking to things outside Svelte's reactivity: DOM measurement, a
third-party library instance (echarts, TipTap), timers, event listeners,
subscriptions. Such an effect returns a cleanup function. If an effect has no
cleanup and no external side effect, it should not exist.

Check: `grep -rn '\$effect(' src` lists 10 files; each must be a 5.2 case.

### 5.3 An effect never writes state it reads

Reference case: `todos/TodoEditModal.svelte` at commit `f17c4ef`, which
crashed the page (`effect_update_depth_exceeded`) with coupled effects. The
committed version shows the mechanism with one:

```ts
$effect(() => {
	const id = todos.editingTodoId;
	if (id === null) {
		keyManager.unregisterAll(keyHandlers);   // reads every key of $state keyHandlers
		return;
	}
	if (id === openedTodoId) return;            // guard against its own previous write
	openedTodoId = id;                           // writes $state it read
	title = todos.editingTodo?.title ?? '';
	keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter); // writes $state it read
});
```

Every write to a `$state` the effect also reads schedules another run. A
guard that compares against a value the effect set last time
(`if (id === openedTodoId) return`) is the tell that a loop was noticed and
papered over. Two such effects feeding each other do not settle.

The fix (`e835b3b`): no effect, no local copy of the title, no handler
bookkeeping in the modal. `<Title {todo} />` owns its draft and its Enter
handler; the modal's only state is `deleteConfirmOpen`.

### 5.4 Resource setup follows the component lifecycle, not store state

A modal that renders only while `todos.editingTodo` exists is, by being
mounted, already "in edit mode". Key handlers, listeners and timers that
belong to that mode are registered in `onMount` (or at script top) of the
component that is mounted exactly during the mode, and released in
`onDestroy`. Watching a store id in an effect to decide when to register is
re-implementing the lifecycle, badly.

### 5.5 Tracking "previous values" in an effect is a `$derived`

```ts
// Bad — calendars/views/week/MobileWeekView.svelte:18-29
let displayedWeek = $state(getCalendarWeek(calendars.currentYear, calendars.currentWeek));
let prevYear = calendars.currentYear;
let prevWeek = calendars.currentWeek;
$effect(() => {
	if (calendars.currentYear === prevYear && calendars.currentWeek === prevWeek) return;
	prevYear = calendars.currentYear;
	prevWeek = calendars.currentWeek;
	displayedWeek = getCalendarWeek(calendars.currentYear, calendars.currentWeek);
});

// Good — the desktop sibling, WeekView.svelte:16
let week = $derived(getCalendarWeek(calendars.currentYear, calendars.currentWeek));
```

Comparing against a hand-kept "previous" copy is re-implementing dependency
tracking. If a value is a function of other reactive values, it is a
`$derived`, full stop.

### 5.6 A transition the store causes is an event the store exposes, not a diff a watcher computes

```ts
// Bad — routes/+layout.svelte (commit 2df74d2)
let wasLoggedIn = false;
$effect(() => {
	if (auth.loggedIn) { wasLoggedIn = true; return; }
	if (isAuthRoute() || isSetupRoute()) { wasLoggedIn = false; return; }
	if (!wasLoggedIn) return;
	wasLoggedIn = false;
	notifications.error(ts.get.auth.session_expired);
	goto(resolve(urls.login));
});
```

The layout keeps a shadow copy of `loggedIn` to notice the moment it flips.
But `Auth` is the thing that flips it, in exactly two places
(`performRecovery`, `validateSession`), and it knows why. The store exposes
that moment (a `setSessionExpiredHandler(fn)` like the existing
`ApiService.setUnauthorizedHandler`, or a dedicated `$state` flag the layout
renders) and the layout reacts to it directly. Rule 5.5 from the other side.

---

## 6. Desktop and mobile variants share their logic

Several features keep a desktop and a mobile component side by side
(`WeekView` / `MobileWeekView`, `DayView` / `MobileDayView`,
`MonthView` / `MobileMonthView`, …). They differ in layout only.

### 6.1 Read the sibling before writing the variant

The second variant copies the first one's approach to state and data: the
same `$derived` for the week, the same store calls, the same helpers. It does
not re-derive the same thing a different way. `MobileWeekView` re-implemented
`WeekView`'s one-line `$derived` as an effect with two tracking variables
(5.5) and `WeekView`'s `day.weekday` read as a function with a cast (2.3).

### 6.2 Anything both variants need is a helper, not a copy

If writing the variant means pasting a block from the sibling (the `hours`
array, a weekday label, an off-hour rule), that block moves to
`src/lib/helpers/` first and both import it.

---

## 7. Reuse shared components

Reference case: `todos/props/Recurrence.svelte`. It hand-rolls two inputs,
six buttons and a popover, each with its own ad-hoc classes, while the
primitives it needed already existed. Its save button is
`rounded bg-c-primary px-3 py-1 text-xs`; the app's buttons are `TextButton`
(`rounded-sm p-1 font-bold bg-c-btn …`). The result works and looks like it
belongs to a different app.

### 7.1 Look before you build

Before writing `<input>`, `<select>`, `<textarea>`, a save/cancel/delete
button, a modal or a popover, check these directories and use what is there:

| Need | Look in |
| --- | --- |
| Any form control: text, number, date, time, select, toggle, checkbox, slider, file, autocomplete | `src/lib/components/forms/` |
| Any button: labelled action (`TextButton` with its `type` variants), icon-only action, hover-reveal inline action | `src/lib/components/ui/buttons/` |
| Modal, confirmation dialog, bottom sheet, popup | `src/lib/components/ui/` (`*Modal.svelte`) |
| A popup anchored to a trigger | `use:portalToBody` from `helpers/PortalHelper` (see `todos/props/DueDate.svelte`) |
| Badge, card, tabs, headings, form rows | `src/lib/components/ui/` |

List the directory; do not guess from memory. The file names say what they
are.

### 7.2 Extend, don't fork

If a primitive is missing a prop (a width, a class passthrough, an
`aria-label`), add the prop to the primitive. Do not copy its markup into the
feature with a tweak.

### 7.3 If nothing fits, build it with the existing vocabulary

A new control goes into `forms/` or `ui/`, not inline in the feature, and
takes its classes from the nearest existing primitive so it looks like the
rest of the app. An inline, one-off control with its own colour and radius is
not an option.

### 7.4 Where raw elements are still fine

A feature-specific inline trigger with no primitive equivalent: the
"+ add due date" text button and the hover-reveal trash in
`todos/props/DueDate.svelte` are raw `<button>`s and that is correct. Form
controls (anything the user types or picks into) and standard actions (save,
cancel, delete, confirm) are never raw.

Bad (`Recurrence.svelte:117-123, 131-136, 140-151`):

```svelte
<input type="number" min="1" max="365" bind:value={selectedInterval}
	class="w-14 rounded border border-c-neutral-2 bg-transparent px-2 py-1 text-center dark:border-s-dark" />
<input id="recurrence-ends-at" type="date" bind:value={selectedEndsAt}
	class="rounded border border-c-neutral-2 bg-transparent px-2 py-1 dark:border-s-dark" />
<button class="rounded px-3 py-1 text-xs text-c-neutral-5 …" onclick={() => (isOpen = false)}>Cancel</button>
<button class="rounded bg-c-primary px-3 py-1 text-xs text-white …" onclick={save}>Save</button>
```

Good:

```svelte
<NumberInput bind:value={selectedInterval} min={1} max={365} />
<DateInput bind:value={selectedEndsAt} />
<TextButton title={ts.get.layout.modal_cancel} type="plain" onclick={close} />
<TextButton title={ts.get.layout.save} type="primary" onclick={save} />
```

Check: `grep -rl '<input' src --include='*.svelte' | grep -v /forms/` lists
8 files today; each one is either a 7.4 case or a violation.

---

## 8. i18n

### 8.1 Every visible string goes through `ts.get`, no exceptions

Not a single user-facing word is written as a literal in a component: not a
button label, not a placeholder, not a unit, not a fallback like
`'occurrence(s)'`. If the key does not exist, add it to all four locale
files (`en`, `de`, `es`, `fr`); `npm run check` enforces that the four files
match each other.

What the tooling does **not** catch: a hardcoded string in a component.
`npm run check` and `npm run lint` both pass on `Recurrence.svelte` with its
literal `Cancel` and `Save`, even though `ts.get.layout.modal_cancel` and
`ts.get.layout.save` already existed. So this rule rests on the author and
the reviewer, which is why it is spelled out here despite being a hard rule
in `AGENTS.md`.

Bad (`Recurrence.svelte:116, 125, 144, 150`):

```svelte
<span>Every</span>
… ?? 'occurrence(s)'}
<button …>Cancel</button>
<button …>Save</button>
```

Good:

```svelte
<TextButton title={ts.get.layout.modal_cancel} type="plain" onclick={close} />
<TextButton title={ts.get.layout.save} type="primary" onclick={save} />
```

Check: look for bare words between tags or in `placeholder=`/`title=`
attributes that are not a `{…}` expression.

---

## 9. Keyboard handling goes through `KeyManager`

`src/lib/state/KeyManager.svelte.ts` is the one place that listens for keys. The
root layout forwards every `keydown` to it
(`routes/+layout.svelte:155`), and 37 components register with it. It gives
priorities, `preventOthers`, helper-key restrictions and central cleanup,
none of which a private listener has.

### 9.1 No private keyboard listeners

Not allowed anywhere in `src/`:

- `window.addEventListener('keydown', …)` / `document.addEventListener(…)`
- `<svelte:window onkeydown>` / `<svelte:document onkeydown>`
- an `onkeydown` attribute on an element that implements a shortcut

The idiom (`todos/props/Title.svelte`):

```ts
const keyManager = getKeyManager();
let keyHandlers: { [key: string]: string | null } = { Enter: null, Escape: null };

keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter);
keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);

onDestroy(() => keyManager.unregisterAll(keyHandlers));
```

Register when the mode starts (mount, or entering edit mode), keep the ids,
release them all in `onDestroy` and when the mode ends. A registration
without its matching release leaks across routes.

### 9.2 If `KeyManager` does not know the key, extend `KeyManager`

`SupportedKey` in `src/lib/types/keydown.ts` is currently
`Enter | Escape | Space | ArrowLeft | ArrowRight | e | f | s | n | F1`. A
component that needs another key adds it there and to the handler map in
`KeyManager`; it does not fall back to `window.addEventListener`. This is
rule 7.2 applied to the key layer.

Reference: `libraries/shared/ShelfView.svelte` used a raw `window` listener
for arrow-key navigation because arrows were not a `SupportedKey`; the arrows
were added to `KeyManager` and the view now registers them like any other
key.

### 9.3 Where a plain `onkeydown` is still right

An input's own key behaviour that only makes sense while that input has
focus and is not a shortcut, e.g. Enter in a single search field. Even then,
prefer `KeyManager` if the component already registers other keys, so one
place owns the cleanup.

Check:

```
grep -rnE "addEventListener\('key|<svelte:(window|document|body) onkey|onkeydown=" src
```

should return only the two `keyManager.handleKeyDown` forwarders in the
layouts and the 9.3 cases.

---

## 10. Comments

### 10.1 The default is zero comments

Well-named, well-structured code is self-explanatory. A comment is a sign the
code did not manage to say it; the fix is to rename or restructure, not to
annotate. If you are about to write a sentence explaining *what* a block does,
extract a function whose name is that sentence.

Baseline in this repo: 340 of 380 components and 35 of 37 stores contain no
comment at all. The commented files cluster in AI-written features.

Not allowed:

- A comment describing what a component, class or function is. The name and
  the signature say that. (`DayLifeMarks.svelte:12-16` in f2b818d: five lines
  of prose restating the props and the settings rules.)
- A comment narrating the next line ("Only check subscription if we have
  permission", "Convert subscription to JSON format").
- Section separators (`// --- drag & drop ---`). A file that needs chapters
  needs splitting.
- Commented-out code.
- JSDoc blocks on internal functions.

Allowed: a one- or two-line *why* for a constraint the code cannot express,
placed directly at the line it concerns. A browser quirk, an API contract, a
bug being worked around. Nothing else.

Worked example, commit 2df74d2 (`Auth.svelte.ts`, `ApiService.ts`):

- Keep: the note above `AUTH_ENDPOINTS` (a 401 from login must not trigger
  recovery or it loops), and "network errors propagate; never trigger
  logout" on `fetchWithRecovery`. Both are constraints a reader cannot infer.
- Remove: `// (a) Another tab may already have refreshed…`,
  `// (b) Refresh this session (single-flight).`, `// (c) Only a definitive
  auth rejection ends the session`, the JSDoc on `recoverFromUnauthorized`
  and `validateSession`, `// Single-flight: …` above an `if (inFlight)
  return inFlight`. Each restates the line below it. The lettered ladder is
  a function whose steps are three named calls.

Check: `grep -rnE '^\s*(//|<!--|/\*)' src` should return only lines a reviewer
can justify as an external constraint.

---

## 11. Stores: where shared state lives

Reference case: `components/calendars/dnd/CalendarDragState.svelte.ts`,
the only `export const x = $state(…)` in the repo.

### 11.1 Reactive state shared between components lives in `src/lib/state/`

As a class with `$state` fields, created with `setX()` in the layout that
owns its lifetime and read with `getX()`, like the other 37 stores. Not as
an exported reactive object in a `.svelte.ts` next to the components.

Why: a module-level singleton lives for the whole app, cannot be reset when
its route unmounts, cannot be injected or replaced in a test, and is
invisible in the `+layout.svelte` bootstrap that lists every store the app
has. It is also the one shape the rest of the codebase never uses, so a
reader looking for "where is drag state" looks in `state/` and finds nothing.

Two shapes, one of them allowed outside `state/`:

- **Shared state** (read by more than one component, or alive beyond one
  component): a context store in `src/lib/state/`. `KeyManager.svelte.ts`
  is one of these.
- **A reactive helper class** that one component instantiates, with its own
  `$state`, no `setContext`/`getContext` and no module-level instance, may
  live in `src/lib/helpers/` as `.svelte.ts`. `helpers/SwipeNavigate.svelte.ts`
  is the reference: `new SwipeNavigate({ onLeft, onRight })`, handlers
  spread onto an element, a `$derived` `style` read in markup. This is the
  right shape for a behaviour that must expose both handlers and a reactive
  value; a bare action cannot.
- A module-level `export const … = $state(…)` is never allowed.

Check: `grep -rn '^export const .* = \$state' src` is empty. Every
`.svelte.ts` outside `state/` is a class with no `setContext`/`getContext`.

### 11.2 One feature, one home per layer

The calendar drag feature is spread over three places: the state module
(state, six mutators, a DOM query, a date parser, a 110-line pointer
controller), `services/CalendarDragService.ts` (snap and request math), and
~100 lines of `computeTarget`/`commitMove` in `views/week/Day.svelte`.

Target shape, using only layers the repo already has:

- `state/CalendarDrag.svelte.ts`: the reactive fields and the begin / update
  / finish / cancel methods.
- `services/CalendarDragService.ts`: the pure math (already there).
- A Svelte action for the pointer wiring, `use:draggableEvent={item}`,
  replacing the four `onpointer*` attributes pasted onto each event button
  (`Day.svelte:191-194, 231-234`). Precedent: `use:portalToBody` in
  `helpers/PortalHelper`.
- `parseDateSlug` next to the `formatDate` whose output it parses, in
  `DateHelper`.

### 11.3 Resetting state is one assignment

`clearCalendarDrag()` sets six fields to their initial values one by one.
Keep the initial value as a constant and assign it (`Object.assign(this,
INITIAL)` or re-assign the fields from one object), so adding a field cannot
forget the reset.

### 11.4 A store that attaches listeners or timers has a `destroy()`

`Auth.startSessionMonitor()` (commit 2df74d2) registers `visibilitychange`,
`online` and an interval, and keeps the handler references in fields, but
there is no `destroy()` that removes them. Either the fields are dead
bookkeeping or the cleanup is missing; both are wrong. `Viewpoint` is the
reference: collect each cleanup closure, run them all in `destroy()`, call
it from the owner's `onDestroy`.

### 11.5 One store, one responsibility; split the self-contained part

`Auth.svelte.ts` is 541 lines after 2df74d2: login, registration, passkeys,
refresh, 401 recovery, session monitoring, profile cache. The session monitor
(interval + visibility + online + validate) has its own lifecycle and talks
to `Auth` through two methods; it is a class of its own. Split only what is
self-contained; do not shard a store into helpers for its own sake.

---

## 12. Store methods

Reference case: `Calendars.loadEvents()` (`state/Calendars.svelte.ts:117-177`).

### 12.1 No unused parameters

`loadEvents(month: string | null = null, year: string | null = null)` reads
neither; it uses `this.currentYear`/`this.currentMonth`. No caller passes
them. A parameter that is not read is removed; a default that is never
overridden is removed.

A function that implements a contract keeps the contract's parameters
whether or not it reads them. A `KeyManager` handler is
`(event: KeyboardEvent) => void` and is declared exactly that way; the same
goes for any callback whose type is set by the thing that calls it.
Dropping the parameter at the call site because "it compiles" is wrong: the
signature is the contract, and the body not using it today is not a reason
to hide it. If a contract parameter turns out to be unnecessary, it is
removed from the contract and from every implementer in one change, never
from individual implementers. This rule is about parameters a function
invented for itself, not parameters it was given.

Because of that exception, `tsconfig.json` deliberately does not set
`noUnusedParameters` (tried on 2026-10-12: 49 of its 55 hits were contract
parameters). This rule is on the author and the reviewer.

### 12.2 A `load*()` method is fetch, convert, assign

```ts
async loadEvents(): Promise<void> {
	const res = await this.apiService.list(apiRoutes.calendars.listEvents.replace('%s', this.currentYearMonth()));
	if (!res) return;

	const events = this.eventService.fromApi(res.data as CalendarEventResponse[]);
	this.events = events;
	this.sortedEvents = this.eventService.groupByDay(events);
}
```

Converting the payload and building an index are pure transformations and
belong in a `services/*Service.ts` with unit tests (rule 13.1). The current
method does all three jobs inline in 60 lines with four levels of nesting.
Existing good shape: `Todos.load()` sequences named steps.

### 12.3 API shape and domain shape are two types; convert once, cast never

`CalendarEvent.start_date` is typed `Date`, but the API sends strings. So
`res.data as CalendarEvent[]` is false when written, and three
`<CalendarEvent>itemWithDates` casts (the only angle-bracket casts in the
repo) exist to make the converted object fit the same name. The guard
`if (start_date !== null)` on a non-nullable field is further evidence.

Correct shape: `CalendarEventResponse` (what the API returns, strings) and
`CalendarEvent` (what the app uses, `Date`s), plus one typed
`fromApi(response): CalendarEvent` function. After that there is nothing to
cast. When a cast is unavoidable at the API boundary, use `as`, not `<T>`.

### 12.4 Inside a loop, repeated blocks are one line or one helper

- "Create the bucket if missing, then push" appears twice
  (`:150-154`, `:167-171`): `(map[slug] ??= []).push(event)`.
- Walking day by day with `currentDate = new SvelteDate(currentDate.setDate(currentDate.getDate() + 1))`
  mutates and rewraps in one expression. `eachDayBetween(start, end)` in
  `DateHelper`, and the loop reads as prose.
- `getDateDiffInMinutes(start, end) > 1440` is "spans more than one day";
  say it with a named helper or constant.

---

## 13. External formats are parsed and built in services

Reference case: `ChooseRecurrenceRule.svelte:23-50` (`initializeFromRule`)
and `:114-154` (`createRecurrenceString`), an RRULE parser and serialiser
written inline in a component as `rule.includes('FREQ=…')` chains.

### 13.1 Parse and build live in a `*Service.ts`, as pure functions, with tests

Anything that reads or writes a wire format (RRULE, ICS, a date string
format, an API payload shape) is two pure functions in
`src/lib/services/`: `parse(input): TypedValue` and `build(value): string`.
They take and return typed objects, never component state, and get a unit
test in `tests/` with real inputs, including ones the parser must round-trip
unchanged.

### 13.2 The component holds one typed value, not N primitives

```ts
type RecurrenceSelection = {
	type: 'daily' | 'weekly' | 'monthly_date' | 'monthly_weekday' | 'yearly';
	weekdays: Weekday[];
	monthlyOrdinal: 1 | 2 | 3 | 4;
	monthlyWeekday: Weekday;
};
```

Bad: `type`, `monthlyWeekdayFrequency`, `monthlyWeekdayDay`, `weeklyMonday`
… `weeklySunday`, ten `$state` variables that are really one value. The
parent binds the one value and derives the string from it when it needs it
(rule 3.3).

### 13.3 Read fields, do not sniff the string

A parser reads each field once (`/FREQ=(\w+)/`) and switches on it. A chain
of `includes()` checks over the whole string depends on branch order
(`MONTHLY && BYSETPOS` must precede `MONTHLY`), which is the kind of hidden
constraint that would need a comment. Structure it so it does not.

### 13.4 Seven of anything is a loop

Seven boolean states and seven copy-pasted checkbox blocks
(`ChooseRecurrenceRule.svelte:167-214`) are one array and one `{#each}` over
the day options.

---

## 14. `SvelteDate`

### 14.1 `SvelteDate` only for a date that is mutated in place while rendered

`SvelteDate` (`svelte/reactivity`) is a `Date` whose setters notify and whose
getters are tracked. It exists because `$state` does not proxy class
instances, so `form.start_date.setHours(9)` on a plain `Date` would change
nothing on screen. That is its one job.

Use it: form state that is edited with `setHours`/`setMinutes`/`setDate`
(`calendars/EventEdit.svelte` does this correctly, and copies the loaded
value with `new SvelteDate(activeEvent.start_date)` so the store's object is
never aliased).

Do not use it: dates that are only read, or replaced wholesale. API payloads
converted in a `load*()` method (`Calendars.loadEvents()` wraps four dates
per event for nothing), helper return values (`parseDateSlug`), and
read-only props (`date: SvelteDate` on `CalendarMarks`) are plain `Date`.
Reading `event.start_date.getHours()` in markup is reactive through the
tracked property read; the method call needs no help.

What it does not do:

- It does not advance with the clock. `new SvelteDate()` in a method is a
  fixed timestamp; nothing re-evaluates as time passes.
- It ignores `vi.setSystemTime` (see `TESTING.md` §7), so every unnecessary
  `SvelteDate` is a test that cannot pin "today".

Check: every `import { SvelteDate }` (4 files today) should be in a
component or store that calls a setter on it.

---

## 15. Architecture conventions

The shape of the app that the other sections assume. Each item is verified
against the code as of 2026-10-12; where this section and anything older
disagree, this section wins.

### 15.1 Data flow is one-directional and client-only

Component → store (`src/lib/state/*.svelte.ts`) → `ApiService` → REST API.
No `+page.server.ts`, `+server.ts` or `load` functions anywhere; a route's
layout calls `store.load()` in `onMount`. Components never call the API;
they call store methods.

### 15.2 Stores are context singletons

One class per domain, one file named after it, `.svelte.ts`. Below the
class: a `Symbol` key and a `setX()`/`getX()` pair, nothing else.
App-wide stores are created once in `src/routes/+layout.svelte` (13 today);
feature stores in the feature's `+layout.svelte` (22 today), so they live
only while the feature is mounted. `getX()` never constructs; a missing
provider is a bug.

Member order inside a store: `static readonly` constants, `$state` fields,
collaborators (`auth`, `apiService`, `localStorage`, services), constructor,
public methods, private methods.

Collaborators are constructor parameters with defaults, so `new Todos()`
still works everywhere and a test can pass mocks without module mocking:

```ts
auth: Auth;
apiService: ApiService;
localStorage: LocalStorageService;

constructor(
	auth: Auth = getAuth(),
	apiService: ApiService = auth.apiService,
	localStorage: LocalStorageService = new LocalStorageService()
) {
	this.auth = auth;
	this.apiService = apiService;
	this.localStorage = localStorage;
}
```

Reference: `Todos`, `Finances`. The field-initialiser shape
(`auth = getAuth();` at class level) is the old style; no store uses it any
more. Do not write new stores that way.

How this fits the context pattern: the defaults call `getX()`, which is
`getContext`, so `new Todos()` is only ever executed by `setTodos()` at
component initialisation, after `setAuth()` has run in the same or an
ancestor component (the root layout runs `setAuth()` first). That is the
same constraint the old style had. Never construct a store at module level
or inside an async callback. A test that passes explicit arguments skips the
defaults and needs no context at all.

### 15.3 `ApiService` is the only place that calls `fetch`; `apiRoutes` the only place with a URL

Every endpoint is a named entry in `src/lib/config/apiRoutes.ts` with
`%s`/`%d` id slots. No store or component builds a URL string or calls
`fetch`. Known violation in the backlog: `weather/ManageWeatherCity.svelte`
(backlog 22). The
pre-auth health check in `routes/setup/+page.svelte` is the one accepted
direct call.

All stores share `auth.apiService`; nobody constructs a second `ApiService`
(the token snapshot that caused the stale-session bug, commit 2df74d2).

### 15.4 `load()` and `loaded`

A domain store exposes `async load(): Promise<void>` that fetches and
assigns, and a `loaded` flag set on first success (24 stores). On a failed
request the previous state stays; there is no partial update. Sub-loads are
their own `loadX()` methods. The body of a `load*()` is fetch, convert,
assign (12.2).

### 15.5 CRUD methods are deliberately repetitive

```ts
async delete(todo: Todo): Promise<boolean> {
	const ok = await this.apiService.delete(apiRoutes.todos.delete, todo.id);
	if (ok) await this.load();
	return ok;
}
```

Build a typed request object, call `ApiService`, reload on success, return
the result. This is the one place where copying the nearest method is the
rule: each is a greppable, independently readable contract. No generic
`crud(endpoint, method)` helper.

### 15.6 Persistence is `LocalStorageService` only

The client stores tokens, theme and preferences, nothing else, and only
through `LocalStorageService` (it guards `browser` itself). Keys are
`static readonly LS_*` constants on the owning store, `snake_case` values.
Zero direct `localStorage.` reads exist today; keep it so.

### 15.7 The loading indicator stops on every exit path

```ts
loadingIndicator.start();
await todos.changeTitle(todo, title);
loadingIndicator.stop();
```

Validate before `start()`, or `stop()` before every early `return`, or use
`try/finally`. A `start()` followed by a bare `return` leaves the global
spinner up.

### 15.8 Pure logic lives in `services/` and `helpers/`

Filtering, sorting, grouping, scoring, parsing, formatting: a
`*Service.ts` (domain logic, `new`-able, no context reads, no I/O) or a
`*Helper.ts` (plain exported functions, no Svelte, no DOM). Both are
unit-tested in node. A store is glue that sequences them; a component calls
them. See sections 12 and 13.

### 15.9 Types mirror the API, one file per domain, type-only imports

`src/lib/types/<domain>.ts`, snake_case fields as the API sends them,
`import type`. API shape and domain shape are separate types when they
differ (12.3). Runtime constants do not live in `types/` (the two
historical exceptions, `check_in.ts` and `quick_add.ts`, are not a
precedent).

---

## Decisions

- The Svelte 5 class array form (`class={[…]}`) is allowed. It has zero uses
  today, so adopting it is a deliberate choice, made because `class:` cannot
  express names with `/`.
- Snippets are the tool for repeated markup within a file.
- No formatter. Prettier and its plugins were removed on 2026-10-12: it
  rewrote deliberate formatting (multi-line `style` attributes, compact
  i18n rows, one-line ternaries) and its output does not match how the
  owner writes. `npm run lint` is `eslint .` only. Formatting is by hand,
  following section 1 and the shapes of hand-written files.
- ESLint runs the recommended `js`, `typescript-eslint` and `eslint-plugin-svelte`
  sets with these adjustments, all made on 2026-10-13 while clearing the
  233 errors the sets reported (see `eslint.config.js`):
  - `no-unused-vars` with `args: 'none'` (contract parameters, 12.1) and
    `ignoreRestSiblings` (the `const { [k]: _, ...rest }` idiom).
  - `svelte/no-navigation-without-resolve` with `ignoreLinks: true`: an
    `href` built from API data can never satisfy the rule. `goto()` targets
    are `resolve(urls.x)`; a `goto` on a route taken from a list gets a
    disable comment with the reason, since `resolve()` rejects a plain
    string.
  - `svelte/prefer-svelte-reactivity` off: it flags every `new Date/Map/Set/URL`
    in a `.svelte` file, including throwaway locals, and has no options.
    Rule 14.1 governs.
  - `no-explicit-any` stays on. Snippets are typed `Snippet`, component
    props `Component`, callbacks `() => void`; browser globals the shells
    inject (`window.electronAPI`, `window.Capacitor`) are declared in
    `src/app.d.ts`.
  - `svelte/no-at-html-tags` stays on; the nine `{@html}` sites render
    `DOMPurify.sanitize(...)` and carry a per-line disable saying so.
  - `.claude/**` and `docs/**` are ignored.
- "Reset X when Y changes" is an explicit reset where the change happens: in
  the handler, in `afterNavigate`, or in the store's setter. It is not a
  writable `$derived` that reads `void dep` only to re-run, and not a
  `{#key}` block that remounts a subtree to throw state away. Decided by the
  owner on 2026-10-14. Examples: the check-in draft (c4a6c12) and the
  library `shelfIndex`, now held in each library store (828a402).
- `BEST_PRACTICES.md`'s "extract at three or more copies" is superseded.
  Cross-cutting browser/platform code is extracted on first write (2.4);
  everything else at the second copy.
- This document must stay correct. Precise, checkable detail is wanted
  (commands, file references, counts) as long as it will not go stale soon.
  Inventories of individual component names are avoided; directories and
  stable workhorses (`TextInput`, `TextButton`, `ContentModal`) are named.

## Open questions

None. The five questions from the first session were decided on 2026-10-12
and are folded into rules 1.5, 3.3, 3.6, 11.1 and 15.2.
