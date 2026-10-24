# Tasks: Change Password

id: queen
analyst: @analyst
date: 2026-10-15

## Context (verified)

Branch check: worktree HEAD is `feature/queen_change-password`, matching `brief.md`.

**API endpoint** (checked in github.com/solyto/api, `routes/api.php`, `app/Api/Users/...`):

- `PUT /api/v1/users/change-password` (behind `auth:sanctum`), `UserController::changePassword`.
- Request (`ChangePasswordRequest`):
  - `current_password`: required, string; an `after()` hook checks it against the stored hash.
    On mismatch: `errors.current_password = ['The current password is incorrect.']`
  - `new_password`: `required | confirmed | Password::defaults()`, so the body also needs
    `new_password_confirmation`. If it equals the current password:
    `errors.new_password = ['The new password must be different from your current password.']`
- Success: `200 { success: true, message: 'Password changed successfully.', data: null, timestamp }`.
- Validation failure: `422 { success: false, message, errors: Record<string, string[]>, timestamp }`.
  This is the same envelope `AuthActionResponse` (`src/lib/types/auth.ts`) already models.
- **Important side effect:** `UserService::changePassword` runs `$user->tokens()->delete()`. That
  revokes **every** token, **including the one that made the request**. After a successful change,
  the current client session is dead. The next request would 401, the refresh would be rejected,
  and the generic "session expired" path would fire. The frontend must handle this on purpose
  (clear the local session and send the user to login with a success message), not by accident.
- I could not read the `Password::defaults()` configuration (the provider file was not at the
  expected path). The existing reset-password page enforces min length 12 on the client and
  maps a server `errors.password` to `ts.get.auth.password_compromised`. Mirror that.

**Frontend gaps:**

- `apiRoutes.users` has no change-password entry.
- `ApiService.put()` returns only a `boolean`, so the UI cannot tell "current password wrong"
  from "new password compromised" from a generic failure. The only body-returning variant,
  `postRaw<T>()`, is POST-only, and this endpoint is PUT.
- The settings page has **no "Account" section** today. Its sections are Appearance, Localization,
  Features, Notifications, Tags, Plugins, Security, Export Data and App
  (`src/routes/settings/+page.svelte`). The brief asks for the feature "under 'Account'", so this
  plan adds a new **Account** section (see Open questions).

Reusable pieces already in the repo: `PasswordInput`, `PasswordStrengthIndicator`,
`PasswordMatchIndicator` (`src/lib/components/forms/`), `SettingsSection`, `TextButton`,
`getUiNotifications`, `getLoadingIndicator`, and the existing i18n keys `auth.password_error`,
`auth.password_compromised`, `auth.password_confirmation_error`. The form in
`src/routes/auth/reset-password/+page.svelte` is the closest sibling to read first (STANDARDS 7.1).

## Task breakdown

TASK-1: Add a `putRaw<T>()` method to `ApiService` that mirrors `postRaw<T>()` (PUT, JSON body, goes through `fetchWithRecovery`, returns the parsed JSON body whatever the status), plus unit tests for it.
     files: src/lib/services/ApiService.ts, tests/unit/services/ApiService.test.ts
     depends: none
     risk: low. It is an additive method that copies an existing pattern, and existing callers are untouched. The change-password route must **not** go into `AUTH_ENDPOINTS`: a 401 there is a real expired session, so recovery is correct.

TASK-2: Add the endpoint `users.changePassword: API_URL + '/users/change-password'` to `apiRoutes`.
     files: src/lib/config/apiRoutes.ts
     depends: none
     risk: low. It is a single config entry.

TASK-3: Add `Auth.changePassword(currentPassword, newPassword, newPasswordConfirmation): Promise<AuthActionResponse>`. It calls `apiService.putRaw` with `{ current_password, new_password, new_password_confirmation }`. On `success` it clears the local session (`this.logout()`), because the API has already revoked the token.
     files: src/lib/state/Auth.svelte.ts
     depends: TASK-1, TASK-2
     risk: medium. Logging out on success changes auth state. The method must clear the session only on success, and must not call `expireSession()`/`sessionExpiredHandler`, or the user sees a misleading "session expired" error.

TASK-4: Add the new i18n keys to `translation.ts` and all four tables (en, de, es, fr):
     - the settings section title `account`
     - the subsection label `change_password`
     - labels for the current, new and confirm password fields
     - the submit button text
     - `current_password_incorrect`
     - `new_password_same_as_current`
     - a success message like "Password changed. Please sign in again with your new password."
     - a generic error message

     Reuse the existing `auth.password_error`, `auth.password_compromised` and `auth.password_confirmation_error` instead of duplicating them.
     files: src/lib/types/translation.ts, src/lib/i18n/en.ts, src/lib/i18n/de.ts, src/lib/i18n/es.ts, src/lib/i18n/fr.ts
     depends: none
     risk: low. The work is mechanical, and `npm run check` catches any missing keys.

TASK-5: Create an `AccountSettings.svelte` component with a "Change password" `SettingsSection` holding a form.
     - Fields: current password (`PasswordInput`); new password (`PasswordInput` + `PasswordStrengthIndicator`); confirmation (`PasswordInput` + `PasswordMatchIndicator`).
     - Client checks, mirroring the reset-password page: current password not empty, new password at least 12 characters, confirmation matches, new password differs from current.
     - Submit through `auth.changePassword`, with the loading indicator stopped on every exit path (STANDARDS 15.7).
     - Map server errors per field: `errors.current_password` → "incorrect"; `errors.new_password` → "same as current" if that is the message, otherwise `password_compromised`; anything else → generic error notification.
     - On success: success notification, then `goto(resolve(urls.login))`.
     files: src/lib/components/settings/AccountSettings.svelte (new)
     depends: TASK-3, TASK-4
     risk: medium. The component has to tell the two `new_password` failure reasons apart. The API returns only English messages, so matching on message text is fragile. A safer option is to check "new === current" on the client first and treat any server `new_password` error as `password_compromised`/invalid. The developer should pick this and note it. Also follow STANDARDS §3 and §5: no `$effect`, `$derived` only if strictly needed, and only rendered state is `$state`.

TASK-6: Register the Account section on the settings page: add `{ id: 11, title: ts.get.settings.account, component: AccountSettings }` to `sections`. Put it just before Security (or as the first entry; see Open questions). The mobile and desktop settings navigation take `sections` as a prop, so they should need no change. Verify that.
     files: src/routes/settings/+page.svelte (read-only check: src/lib/components/settings/SettingsNavigationMobile.svelte, SettingsNavigationDesktop.svelte)
     depends: TASK-5
     risk: low. It adds one array entry. The ids are non-sequential, and 11 is unused.

TASK-7: Verify with `npm run check`, `npm run lint` and `npm test`. If an API is available, also do a manual pass:
     - wrong current password → inline error
     - new password equal to the current one → inline error
     - mismatched confirmation → inline error
     - success → notification, redirect to login, no "session expired" toast, old password rejected and new password accepted at login
     files: none
     depends: TASK-1 … TASK-6
     risk: low. This is verification only.

## Open questions / assumptions

1. **Where does "Account" go?** No Account section exists, so this plan creates one with the
   change-password form as its only content. Two other readings are possible: putting the form
   inside the existing **Security** section (next to Passkeys), or placing it on `/profile`, whose
   help text says "Manage your account". The brief explicitly says "in the settings" under
   "Account", so a new section is the most literal reading. The owner should confirm the name and
   its position in the list (assumed: directly before Security).
2. **Forced re-login after the change** is dictated by the API, which revokes all tokens including
   the current one. This plan treats it as intended behaviour and tells the user. If the owner wants
   the user to stay signed in, that needs an API change (keep the current token or return a new
   one), and that is out of scope for this frontend job.
3. **Password rules** (`Password::defaults()`) could not be read. The plan assumes the same rules
   the reset-password page enforces (min 12, compromised check).
4. **New `ApiService.putRaw`**: this adds a method to an existing service, mirroring `postRaw`. No
   existing method can return a PUT response body, so I don't see an alternative that doesn't break
   STANDARDS 15.3 (no direct `fetch`).
