# Verdict: Explain an unconfirmed email on login and offer to resend

id: passenger
reviewer: reviewer
date: 2026-10-29

## Review

Reviewed `git diff main...HEAD`. Every change in `src/` matches `implementation.md`, and nothing is out of scope.

TASK-1: PASS
notes: `Auth.login` (`src/lib/state/Auth.svelte.ts:114`) now calls `postRaw` and returns
`LoginActionResponse` (`src/lib/types/auth.ts:79`). Success still depends on `data`
being present, and the session setup is unchanged. A non-JSON body (`SyntaxError`)
becomes `{ success: false }`. `RateLimitedError` and `NetworkError` are rethrown.
`LoginResponse` is still imported and still used (lines 166, 331), so there is no
unused import. The page is the only caller.

TASK-2: PASS
notes: `src/routes/auth/login/+page.svelte:50-82`: `emailUnverified` is `$state`
and is cleared on each submit. `email_unverified` shows the inline message and the
"Send a new link" button. Every other failure still shows `login_error` and shakes.
Both handlers stop the loading indicator in `finally`. The submit handler now also
does this when `RateLimitedError` propagates, which fixes a small leak from before.
The resend follows `ResendVerificationForm.send`: same call, and it confirms the
send whatever the outcome, which avoids revealing whether an account exists. The
generic "Didn't get the confirmation email?" link is still there. There is no
cooldown, which is correct because the brief doesn't ask for one.

TASK-3: PASS
notes: The key is in `translation.ts` and in all five locales. The informal voice
matches the nearby strings (de "du", fr "tu"). The developer wrote the translations
instead of the `translator` agent, because no subagent tool was available. The
strings are short, correct, and consistent with the glossary, so this doesn't block.

TASK-4: PARTIAL
notes: `node_modules` isn't installed in this workspace, so neither the developer
nor I could run `npm run check`, `npm run lint` or `npm test`. The manual run also
needs an API that sends `email_unverified`. From reading the code: types line up
(`res.errors?: string[]`, `res.data?: LoginResponse`), all locales have the key,
and the formatting follows the file conventions.

## Security

None found. The resend confirmation doesn't reveal whether the account exists, no
tokens or user data are logged, and `login` is in `AUTH_ENDPOINTS`, so a 401
doesn't trigger session recovery.

## Overall

APPROVED. The code is correct on static review. The verification in TASK-4 couldn't
run in the agent environment, so whoever merges must run `npm run check`,
`npm run lint`, `npm test` and the manual run from the brief. This includes
confirming the assumed error shape `{ success: false, errors: ['email_unverified'] }`
against the API.
