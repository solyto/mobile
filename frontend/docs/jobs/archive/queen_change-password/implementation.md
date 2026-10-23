# Implementation: Change Password

id: queen
developer: @developer
date: 2026-10-15

## Summary

Settings now has an **Account** section, placed just before Security. It holds a "Change password" form that calls `PUT /api/v1/users/change-password`. The API revokes every token when the change succeeds, so the client clears the local session on purpose. It shows a success notification and sends the user to login. The "session expired" path is not triggered.

## Changes

TASK-1: Added `ApiService.putRaw<T>()` in `src/lib/services/ApiService.ts`. It mirrors `postRaw` with PUT and a JSON body, goes through `fetchWithRecovery`, and returns the parsed body whatever the status. The endpoint is not in `AUTH_ENDPOINTS`. Two tests in `tests/unit/services/ApiService.test.ts` cover the request shape and getting the body back on a 422.
TASK-2: Added `apiRoutes.users.changePassword` (`/users/change-password`) in `src/lib/config/apiRoutes.ts`.
TASK-3: Added `Auth.changePassword(current, new, confirmation)` in `src/lib/state/Auth.svelte.ts`. It sends `{ current_password, new_password, new_password_confirmation }` through `putRaw`. When the call succeeds it runs `logout()`, not `expireSession()`. A one-line comment notes the token-revocation contract.
TASK-4: Added 11 `settings.*` keys to `types/translation.ts` and to `en`, `de`, `es`, `fr`: `account`, `change_password`, `current_password`, `new_password`, `confirm_new_password`, `change_password_submit`, `current_password_required`, `current_password_incorrect`, `new_password_same_as_current`, `password_changed`, `password_change_error`. The form also reuses `auth.password_error`, `auth.password_compromised` and `auth.password_confirmation_error`.
TASK-5: New `src/lib/components/settings/AccountSettings.svelte`, built from `SettingsSection`, `PasswordInput`, `PasswordStrengthIndicator`, `PasswordMatchIndicator` and `TextButton`, following the reset-password page.
  - **Client checks:** the current password is not empty, the new password is at least 12 characters and differs from the current one, and the confirmation matches.
  - **Server errors:** `errors.current_password` shows "incorrect". Any `errors.new_password` shows `password_compromised`. Anything else shows a generic error notification.
  - **Decision:** the "same as current" case is caught on the client instead of matching the API's English message text, as the analyst suggested.
  - **Rules followed:** the loading indicator stops before every branch. No `$effect` or `$derived` is used. A snippet handles the repeated error line.
TASK-6: Registered `{ id: 11, title: ts.get.settings.account, component: AccountSettings }` in `src/routes/settings/+page.svelte`, directly before Security. `SettingsNavigationMobile` and `SettingsNavigationDesktop` just loop over `sections`, so they needed no change.
TASK-7: **Not run.** `node_modules` is missing in this worktree, and project rules forbid installing packages without asking. So `npm run check`, `npm run lint`, `npm test` and the manual pass against an API still need to be done.

## Known issues / follow-ups

- Run `npm ci && npm run check && npm run lint && npm test`, then do the manual pass from TASK-7.
- Open questions from `tasks.md` still need the owner to confirm:
  - The section name and position: a new "Account" section before Security.
  - The forced re-login after a change, which the API's token revocation dictates.
  - The password rules: assumed min 12 characters plus the compromised check, because `Password::defaults()` could not be read.
- If the API answers a non-JSON body (e.g. a 500 HTML page), `putRaw` throws, just like `postRaw`. The component does not catch that, the same as the reset-password page.
