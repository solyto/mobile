# Verdict: Change Password

id: queen
reviewer: @reviewer
date: 2026-10-15

## Review

Branch `feature/queen_change-password` is checked out, and the base is `main` (from `.manigot/manigot.json`).
I reviewed every change in `git diff main...HEAD`. Outside the job docs, the diff touches only the files `tasks.md` lists, and I found no unlisted or unrelated changes.

TASK-1: PASS
notes: `ApiService.putRaw<T>()` (`src/lib/services/ApiService.ts:188-196`) is the same as `postRaw`, except that it uses PUT and the body is always JSON. It goes through `fetchWithRecovery`, returns the parsed body whatever the status, and is not added to `AUTH_ENDPOINTS`.
The two new tests check the exact fetch call (method, headers, body) and that a 422 response still returns its body.

TASK-2: PASS
notes: `apiRoutes.users.changePassword = API_URL + '/users/change-password'` (`apiRoutes.ts:30`).

TASK-3: PASS
notes: `Auth.changePassword` (`Auth.svelte.ts:276-285`) sends `current_password`, `new_password` and `new_password_confirmation`.
- On success it calls `logout()`, which is just `clear()`. It does not call `expireSession()`, so the layout's "session expired" toast and redirect do not fire.
- The one-line comment records the API's token-revocation contract, which STANDARDS 10.1 allows.
- If the token has expired, the endpoint returns 401 and the normal refresh-and-retry path handles it. That is correct.

TASK-4: PASS
notes: `SettingsRecords` and all four locale files get the same 11 keys. The translations read naturally (de uses the informal "du" form, as the rest of the file does).
The form reuses the existing `auth.password_error`, `auth.password_compromised` and `auth.password_confirmation_error` keys instead of duplicating them.

TASK-5: PASS
notes: `AccountSettings.svelte` closely follows the reset-password page, and the props it passes to `SettingsSection`, `PasswordInput`, `PasswordStrengthIndicator`, `PasswordMatchIndicator` and `TextButton` match their definitions.
- **Client checks:** the current password must not be empty, the new password must be at least 12 characters and differ from the current one, and the confirmation must match.
- **Validation order:** checks run before `loadingIndicator.start()`, and `stop()` runs before any branch (STANDARDS 15.7).
- **Server errors:** they map to the fields as planned. The "same as current" check runs on the client, which is the safer option the analyst suggested, and the developer documented the choice.
- **Svelte rules:** there is no `$effect` or `$derived`. Only rendered values are `$state`, and the repeated class string is a `const` (STANDARDS 3.5).
- **No hardcoded strings:** every visible string goes through `ts.get`.
- **On success:** `logout()` makes the layout's `canAccessRoute` false. `onsubmit` still finishes and calls `goto(login)`, and the notification store lives in the layout, so the success toast survives the navigation.

TASK-6: PASS
notes: `{ id: 11, title: ts.get.settings.account, component: AccountSettings }` is added directly before Security, and no other entry uses id 11. `SettingsNavigationMobile` and `SettingsNavigationDesktop` take `sections` as a prop, so they need no change.

TASK-7: PARTIAL
notes: The worktree has no `node_modules`, and project rules forbid installing packages, so neither the developer nor I could run `npm run check`, `npm run lint` or `npm test`, and there was no API for a manual pass.
Instead I checked by reading the code:
- every component prop matches the target component's `$props` type
- the i18n keys are identical across `translation.ts` and the four locales
- the `AuthActionResponse` fields used (`success`, `errors?.current_password`, `errors?.new_password`) exist in `src/lib/types/auth.ts`
- the new tests use the same helpers (`jsonResponse`, `vi.stubGlobal`) as the existing ones

I found nothing that should fail type-checking or tests. This is an environment limitation, not a code defect.

## Security

Not run separately. In the code I reviewed, no password or token is logged or persisted. The token revoked by the server is cleared locally on success, and a 401 from this endpoint correctly goes through session recovery rather than being treated as an expected auth failure.

## Overall

APPROVED

No code changes are required. The implementation matches tasks.md and stays in scope.
Before merge, the owner needs to run `npm ci && npm run check && npm run lint && npm test`, because this sandbox could not. The open questions in tasks.md are still the owner's to confirm: where the section goes and what it is called, the forced re-login, and the assumed password rules.
