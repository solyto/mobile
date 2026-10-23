# How the coding standards get written

This describes the way `docs/STANDARDS.md` is built, so the work can be
resumed in a later session by the owner and an AI agent without re-explaining
anything. It is a working agreement, not a policy.

## Goal

One document, `docs/STANDARDS.md`, that states precisely and exhaustively how
code in this repository is written. Every rule in it comes from a concrete
piece of code the owner was unhappy with, or from a hand-written sibling that
shows the intended shape. No rule is imported from a generic style guide.
The document must stay correct; precise detail is wanted as long as it will
not go stale soon.

The older policy docs (`BEST_PRACTICES.md`, `STATE_SERVICES.md`,
`COMPONENTS.md`, `DATA_LAYER.md`, `coding-style.md`) were written by a weaker
model. On 2026-10-12 their still-valid conventions were verified against the
code and folded into section 15 of `STANDARDS.md`, and the files were
deleted. Where anything older disagrees with `STANDARDS.md`, `STANDARDS.md`
wins. `TESTING.md` was trimmed the same day to the parts that describe how
to write a test here.

## Roles

**The owner** brings examples: a file, a line range, a commit, or a thing they
remember being annoyed by. One sentence on what bothers them is enough.
Sometimes the question is genuine ("is this actually wrong?"), and the answer
may be "no, this one is fine".

**The agent** does the investigation and the writing:

1. Reads the cited code, and the hand-written sibling if one exists
   (desktop vs mobile variant, an older component next to it, the version
   before the owner's rewrite in git).
2. Measures instead of asserting: greps the pattern across `src/`, counts
   occurrences, checks `git log`/`blame` for who introduced it, runs the
   tooling (`npm run check`, the Svelte compiler) when a claim depends on
   it. Numbers go in the answer when they change what the reader does.
3. Names the pattern, separates the symptom from the design behind it, and
   says plainly when the owner's own code has the same issue.
4. Proposes rules that a reviewer can apply to a line of code, with a
   before/after from this repo and a way to check (a grep, a command).
5. Writes them into `docs/STANDARDS.md` immediately, restructuring freely.
6. Asks the owner only when a choice is genuinely theirs (two valid shapes,
   a conflict with the owner's own reference code). Everything else is
   decided and written down.

The agent is not condescending and assumes it knows less about the app than
the owner. It is fair: a commit that is engineered well is said to be
engineered well, and the style problems are listed on top of that.

## What the owner said about how to work (so it need not be repeated)

- Throw examples freely; the agent structures, decides what counts, and
  writes. The owner does not want to be asked "shall I write this down".
- When the owner asks a genuine question ("is this really wrong?"), answer
  it with reasoning grounded in Svelte's documented behaviour or in
  measurements from this repo. If the owner's belief is wrong, say so and
  explain why (they asked to be "lectured" on `SvelteDate`).
- When the owner's own code breaks a rule, say it plainly. The owner's
  response was "I make mistakes as well, we fix that later"; log it under
  open questions or the parking lot and move on.
- Credit good engineering where it exists. The verdict on commit `2df74d2`
  was "the engineering is right, the code around it is the usual", and that
  framing was accepted.
- Sessions are isolated; the agent's memory does not survive. Everything
  that matters for the next session lives in this file and in
  `docs/STANDARDS.md`.

## Shape of `docs/STANDARDS.md`

- **Rules**, numbered by section. Each rule has: a one-line rule, why it
  matters, a bad/good example from this repo with file and line, and a check
  where one exists.
- **Decisions**: choices the owner made that are not derivable from the code
  (allowed syntax, superseded rules from the old docs, what the doc itself
  may contain).
- **Open questions**: things waiting for the owner's answer, each with the
  data point that raised it.

Concrete cleanups go to backlog entries in `docs/backlog/` (one job brief
each, naming the rules it serves), never into `STANDARDS.md`.

The owner's own inconsistencies with a rule are recorded under open
questions, not silently dropped and not silently turned into exceptions.

## Resuming

Start a session in this repository and say something like:

> Let's continue the coding standards work. Read `docs/STANDARDS_WORKFLOW.md`
> and `docs/STANDARDS.md`, then I'll give you the next example.

Then throw examples as before. When the examples start landing on rules that
already exist, it is time to stop collecting and finish the document.

## State at the end of the first session (2026-10-12)

Covered: markup expressions and formatting, `class:`/array form, `{@const}`,
snippets, repetition and helpers, reactivity (`$derived`, `$state`, leaf
components), `$effect` in all its wrong uses, external formats as services,
shared primitives, i18n, `KeyManager`, desktop/mobile siblings, module-level
state, store methods, `SvelteDate`, comments, extraction of cross-cutting
browser behaviour.

Done later the same day: the four open questions were decided and folded
into rules 1.5, 3.3, 3.6 and 11.1; the cleanups moved to
`docs/STANDARDS_BACKLOG.md` (since replaced by the entries in `docs/backlog/`).

Still to do:

1. Run the open entries in `docs/backlog/` (the thirteen original jobs are
   done; the current ones came out of the 2026-10-14 audit in
   `docs/reports/`). Each entry says whether tests come first (a logic seam
   exists) or the job relies on the gates plus a manual run (markup only).
3. Keep collecting examples whenever something new annoys the owner; most
   will now land on an existing rule, which is fine.
