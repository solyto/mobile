# Report: publishing solyto on Google Play and the Apple App Store

date: 2026-10-17
read: true
job: jail_play-store-and-app-store-strategy
scope: report only. No code, Gradle, manifest, `patch/`, `frontend/`,
`fdroid/`, `fastlane/`, CI or signing changes were made for this report. No
`ios/` project was created, and no store tooling or release script was run.

## 1. Summary

**Both stores are reachable, but neither can be submitted today.** The
blockers are in the backend and the canonical web app (`../app`), not in
this repo.

**Blockers (both stores):**

1. **No account deletion.** Users can register in the app, but there is no
   delete endpoint in `apiRoutes.ts` and no deletion UI. Google Play needs
   an in-app path *and* a web deletion page. Apple 5.1.1(v) needs deletion
   to be startable in the app (§3 P1/P2, G8, A9).
2. **UGC without moderation.** Dev-requests/comments, public profiles and
   friend feeds have no report/block or terms of use. Apple 1.2 and Play's
   UGC policy require them, or the features need to be hidden in store
   builds (§3 P5, §6.2).
3. **Privacy policy.** It is only an anchor on the landing page, and the
   in-app legal links are most likely hidden in the mobile build because
   `PUBLIC_PRIVACY_URL` is not set (§3 P3/P4).

**Google Play: low technical effort.** The app already targets API 36,
which meets the current deadline. `./gradlew bundleRelease` produces an AAB
with no Gradle change. The main work is account setup and paperwork:
US$25, identity verification, the **12 testers × 14 days** closed test for
new personal accounts, Data safety, content rating, plus **new screenshots
and a feature graphic** (the current screenshots do not meet Play's
format rules). The one real decision is **Play App Signing** (G5, flagged):
uploading the existing key lets GitHub-APK users switch without
reinstalling. F-Droid builds are signed with F-Droid's own key, so F-Droid
users have to reinstall to switch whatever is chosen.

**Apple App Store: high effort and real review risk.** There is no iOS
project yet. It needs a Mac with Xcode 26+, 99 USD/year, `@capacitor/ios`,
and iOS versions of the share target, URL scheme, pull-to-refresh and
safe-area handling. On iOS the WebView origin becomes
`capacitor://my.solyto.app`, which affects CORS and **passkeys** (needs a
prototype). Web Push will not work in the app. The biggest review risk is
**guideline 4.2** (a "repackaged website"). Native features lower that risk.
Sign in with Apple is **not** required.

**Also important, separate from both stores:** Google's Android developer
verification starts on 30 Sep 2026 (four countries) and goes global in 2027.
The maintainer should register `app.solyto` together with **F-Droid's
signing key** so F-Droid installs keep working smoothly (§6.6).

**Recommended order:** fix the blockers → Play closed test → Play
production → iOS project → TestFlight → App Store (§8). Play does not need
to wait for iOS.

## 2. Current state (TASK-1)

All of this comes from the files in this repo as of today.

### 2.1 Build, signing and release

| Area | Current state | Source |
|---|---|---|
| Artifact | A signed **APK** only. CI runs `./gradlew assembleRelease` and renames the result to `solyto-<version>.apk`. No AAB is built anywhere. | `.github/workflows/release.yml` |
| Release trigger | Pushing a `v*` tag. `make release` (`scripts/release.sh`) vendors `../app`, bumps the version, commits, tags and pushes. `make rerelease` deletes the tag and the GitHub release, then releases the **same version again**. | `scripts/release.sh`, `scripts/rerelease.sh` |
| CI toolchain | `ubuntu-latest`, Node 22, Temurin Java 21. CI sets the version from the tag (`npm pkg set version=…`) and then runs `scripts/build-fdroid.sh`. | `.github/workflows/release.yml` |
| Signing (GitHub APK) | `signingConfigs.release` reads `KEYSTORE_PATH`, `STORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` from the environment. CI decodes `secrets.KEYSTORE_BASE64` into `keystore.jks`. This one key is the only developer signing key in use. | `android/app/build.gradle`, `release.yml` |
| Minification | `minifyEnabled false` | `android/app/build.gradle` |
| Signing (F-Droid) | `fdroid/app.solyto.yml` has **no `Binaries:` and no `AllowedAPKSigningKeys:`** entry. F-Droid therefore builds from source and **signs with its own F-Droid key**. It does not publish the developer-signed APK. (F-Droid docs: publishing developer-signed APKs requires the `Binaries` + `AllowedAPKSigningKeys` directives.) | `fdroid/app.solyto.yml`, [F-Droid: Reproducible Builds] |
| Versioning | Root `package.json` `version` (now `1.0.15`) is the source of truth. `build-fdroid.sh` writes `versionName` and `versionCode = MAJOR*10000 + MINOR*100 + PATCH` (`printf "%d%02d%02d"`) into `android/app/build.gradle`. 1.0.15 → `10015`. | `scripts/build-fdroid.sh`, `android/app/build.gradle` |
| F-Droid recipe | `subdir: android/app`, `prebuild: bash ../../scripts/build-fdroid.sh`, `gradle: yes`. Node/npm come from apt. `AutoUpdateMode: Version`, `UpdateCheckMode: Tags`. Builds listed: 1.0.12, 1.0.13, 1.0.15. | `fdroid/app.solyto.yml` |

**What this means for users who switch stores.** Android only installs an
update over an existing app if both are signed with the same key. Today
there are already two incompatible signatures:

- GitHub Releases APK: developer key.
- F-Droid APK: F-Droid's key.

Moving between them already needs an uninstall/reinstall, which loses local
WebView data (login token, custom API URL, theme). The server-side data is
not affected. Google Play adds a third signature unless the maintainer
chooses otherwise (§4, step G5).

### 2.2 Android project

| Area | Current state | Source |
|---|---|---|
| Application ID | `app.solyto` (`namespace` and `applicationId`) | `android/app/build.gradle`, `capacitor.config.json` |
| SDK levels | `minSdk 24`, `compileSdk 36`, `targetSdk 36` | `android/variables.gradle` |
| Capacitor | `@capacitor/android`, `/cli`, `/core` `^7.6.8`. There is no `@capacitor/ios`. | root `package.json` |
| Native code | Java only: `MainActivity` (share intent, edge-to-edge bar colours on API 35+), `PullToRefreshLayout`, `PullToRefreshPlugin` (custom plugin, `addJavascriptInterface`). | `android/app/src/main/java/app/solyto/` |
| WebView origin | `androidScheme https`, `hostname my.solyto.app`. The web app is **bundled** (`webDir frontend/build`) and is not loaded from a remote server. | `capacitor.config.json` |
| Permissions | `INTERNET` only | `AndroidManifest.xml` |
| Components | One activity (`MainActivity`, `singleTask`, `exported`) with MAIN/LAUNCHER, `SEND text/plain`, and `VIEW` on scheme `app.solyto`. One non-exported `FileProvider`. | `AndroidManifest.xml` |
| Backup | `allowBackup="true"`, with no backup rules. Android Auto Backup may copy the WebView data, including the auth token in `localStorage`, to the user's Google Drive backup. | `AndroidManifest.xml` |
| Google services | None. There is no GMS, Firebase or FCM and no analytics SDK. | `android/app/build.gradle` |

### 2.3 Store listing metadata

| Item | Current state | Source |
|---|---|---|
| Locales | `en-US` only. The app UI has en/de/fr/es. | `fastlane/metadata/android/` |
| Title | `solyto` | `title.txt` |
| Short description | "Free, private, all-in-one personal organizer. Self-hostable." (60 chars) | `short_description.txt` |
| Full description | 1,697 chars of F-Droid-style HTML (`<b>`, `<ul>`). It lists features and privacy claims and names the third-party services (Nominatim, DuckDuckGo favicons, Deezer, Discogs, Hardcover, Goodreads, Telegram). | `full_description.txt` |
| Icon | `icon.png` 512×512 | `images/icon.png` |
| Phone screenshots | 5 PNGs, each **518×1149, RGBA (with alpha channel)** | `images/phoneScreenshots/1–5.png` |
| Feature graphic | none | — |
| Changelogs | Only `changelogs/10012.txt` | `changelogs/` |

The fastlane layout is the one `fastlane supply` reads, so Play can reuse
it. Its limits for Play are covered in step G9.

## 3. Shared compliance prerequisites (TASK-2)

Both stores check these items. Status was checked against the vendored
`frontend/` (a copy of `../app`) on 2026-10-17.

| # | Item | Status | Evidence | Owner of the fix |
|---|---|---|---|---|
| P1 | **In-app account deletion** | **Missing (blocker for both stores)** | `apiRoutes.ts` `users.*` has `get`, `updateProfileImage`, `getPublicProfile` and `settings.*`. There is no delete route. A search of `frontend/src` for "delete account", "account deletion", `deleteAccount` and similar finds nothing. `routes/profile/+page.svelte` only offers the profile image, friends, admin link and logout. The settings sections (todo, tags, notifications, localization, features, app, export, security) have no deletion entry. `ApiService` has a `DELETE` helper, but no user endpoint uses it. | **Backend:** a `DELETE /users/me` (or similar) endpoint that removes the account and its data. **`../app`:** a discoverable "Delete account" flow (profile or security settings) with confirmation. **Website:** a public deletion-request page (Play requires this even when an in-app flow exists). |
| P2 | Web account-deletion URL (Play) | **Missing** | Nothing in this repo or the frontend points to such a page. `urls.landingPage` is `https://solyto.app`. | Website / backend operator |
| P3 | Privacy policy URL (store metadata) | **Unknown.** It probably exists on the website. | The cookie banner links to `https://solyto.app/#privacy` (`CookieBanner.svelte`), which is an **anchor on the landing page**, not a standalone policy page. It was not checked whether that section meets the store content rules (Apple 5.1.1(i): what is collected, third parties, retention/deletion, how to revoke consent). | Website |
| P4 | Privacy policy reachable **inside the app** (Apple 5.1.1(i)) | **Partly / likely missing in the mobile build** | `NavLegalEntry.svelte` shows legal links only if `PUBLIC_LEGAL_NOTICE_URL` / `PUBLIC_PRIVACY_URL` / `PUBLIC_TERMS_URL` are set (`lib/config/urls.ts`). `build-fdroid.sh` sets only `PUBLIC_MOBILE`, `PUBLIC_VERSION` and `PUBLIC_REDIRECT_AFTER_LOGOUT`. There is no `.env` in `frontend/`. So the mobile build most likely **hides** the legal menu. The only remaining link is the cookie banner, which disappears after it is acknowledged. | **This repo:** pass the `PUBLIC_*_URL` values in the build (a `build-fdroid.sh` change, see §6.5), *or* **`../app`:** a permanent link in settings. |
| P5 | Terms of use, plus UGC moderation (report/block) | **Missing** | Users can create content that other users see: dev-requests with comments and votes (`apiRoutes.dev.requests.*`), public profiles (`users.getPublicProfile`), friends and friend feeds (`feeds.friendFeeds`), and calendar sharing and invites. The register page (`routes/auth/register/+page.svelte`) has no terms acceptance. No report or block feature was found. Apple 1.2 and Google Play's UGC policy require terms, filtering/reporting and blocking for UGC apps (see §6.2). | Backend + `../app`, or a decision to hide the social/UGC features in the store builds |
| P6 | Demo account for review | **Not set up** | Apple 2.1 asks for demo account details if the app has a login. Play's "App access" declaration asks the same. | Maintainer (a test account on `api.solyto.app`) |

### 3.1 What user data leaves the device (input for Play Data safety and Apple privacy labels)

There are no SDKs, analytics or ads in the app. The data flows all come
from the web app's own code:

| Destination | Data | Trigger | Source |
|---|---|---|---|
| solyto API (`https://api.solyto.app` by default, or a user-set self-hosted URL) | Everything the user enters: name, email, password/passkeys, profile image, todos, notes, calendar events, **contacts**, **finances** (wealth, budget), **check-in mood and health data**, time tracking, libraries, clipboard text and images, feed subscriptions, friends, timezone/language, weather city, Telegram link, optional OpenAI API key (`updateOpenaiApiKey`) | Normal use | `apiRoutes.ts`, `platform.ts` |
| `nominatim.openstreetmap.org` | City search text and the device IP | Typing in the weather city search | `ManageWeatherCity.svelte` |
| `icons.duckduckgo.com` | Hostnames of the user's feeds, links and shortcuts, plus the device IP | Showing favicons | `ImageHelper.ts` |
| `widget.deezer.com` (iframe) | Album ID, IP, plus whatever the Deezer widget collects | Opening a music release preview | `DeezerSneakPreview.svelte` |
| Web Push service (browser vendor) | Push subscription | Turning on push | `ManagePushNotifications.svelte` (probably non-functional in the app, see §6.4) |

Notes for filling in the forms (these are maintainer decisions):

- **Self-hosting.** If a user points the app at their own server, that data
  never reaches the developer. Both forms describe what the developer's
  service (and the app's code) collects. Declare the hosted default
  (`api.solyto.app`). Mentioning self-hosting in the policy is optional.
- **"Collected" vs "shared".** Data sent to solyto's own API counts as
  *collected*. Requests that the app's code sends directly to Nominatim,
  DuckDuckGo or Deezer may count as *shared* with a third party, or may be
  exempt as ephemeral processing. Google's guide covers WebView code under
  the app's control and defines ephemeral processing (see [Play Data
  safety]). This judgement belongs to the maintainer.
- **Sensitive categories.** Check-in (mood/health) is *Health and fitness*.
  Finances is *Financial info*. Contacts is *Contacts*. Clipboard, notes and
  todos are *Other user-generated content*. Expect all of these to be
  declared as collected, linked to the user, and used for app functionality.
- **Encryption in transit.** Yes (HTTPS). The custom API URL field does not
  force `https://` (`setup/+page.svelte` checks only `/api/v1/health`), so a
  self-hoster could enter `http://`. The page origin is
  `https://my.solyto.app`, so WebView mixed-content blocking will probably
  stop such requests anyway (not tested). This does not affect the hosted
  service.
- **Deletion.** The Data safety form asks whether users can request
  deletion and wants the web URL from P2.
- **Backups.** With `allowBackup="true"`, the WebView `localStorage`
  (including the bearer token) can go into Google's device backup. This is
  not "collection" by the developer, but the maintainer may want
  `allowBackup="false"` or backup rules. That would be a manifest change
  and is not part of this report.

## 4. Google Play: ordered steps (TASK-3)

All policy facts come from Google's pages as read on 2026-10-17 (§12).
Google changes these rules often, so re-check them before acting.

**G1. Pick the account type.**
- *Personal account.* You need a government ID. Accounts created after
  13 Nov 2023 must pass the **closed-testing requirement** (G3). New personal
  accounts must also prove they have an Android device, using the Play
  Console mobile app. [Play: Register account] [Play: Testing requirements]
- *Organization account.* You need a **D-U-N-S number** (free from Dun &
  Bradstreet), an official organization document and a government ID. The
  closed-testing requirement applies only to personal accounts. [Play:
  Verify identity] [Play: Testing requirements]
- Fee: **US$25 one-time**. You must be 18 or older. [Play: Register account]
- The developer name, and for personal accounts some contact details, are
  shown publicly on the listing. You also need a verified developer email.
  [Play: Verify identity]

**G2. Create the app in Play Console** with package name `app.solyto`. As
part of the new **Android developer verification**, link the package name to
the verified identity (see G5 and §6.6). [Android developer verification]

**G3. Closed testing (personal accounts only).** Run a closed test with **at
least 12 testers opted in continuously for the 14 days** before you apply.
Testers who leave and rejoin restart their 14 days. Then apply for
production access and answer Google's questionnaire about the test. If
engagement is too low, Google can ask for more testing. An internal test
track can come first. It is optional and has no reviewer gate. [Play:
Testing requirements]
*Practical point:* the existing F-Droid/GitHub users and the project's
community are the obvious place to find testers.

**G4. Build an Android App Bundle.** New apps must be published as an AAB
(required since August 2021). [Android: App bundles]
- Command: `cd android && ./gradlew bundleRelease`. The output is
  `android/app/build/outputs/bundle/release/app-release.aab`.
- The existing `signingConfigs.release` also applies to `bundleRelease`, so
  **no Gradle change is needed** to produce a signed AAB. Which key signs it
  is decided in G5.
- F-Droid is not affected. F-Droid runs its own Gradle build of the APK, and
  `build-fdroid.sh` does not change.
- `minifyEnabled false` is fine for Play.

**G5. Choose a Play App Signing setup (key decision; touches signing
material, so it needs maintainer sign-off).** On Play, Google holds the
*app signing key* that signs what users install. The developer signs
uploads with a separate *upload key*, which Google can reset if it is lost.
By default, a new app gets **Google-generated keys** ("quantum-ready, hybrid
signing"). You can change this and **provide your own app signing key**
before the first open-testing or production release. [Play: App signing]

| Option | What happens | Store switching for users |
|---|---|---|
| **A. Upload the existing keystore's key as the Play app signing key** (PEPK tool) and create a **new upload key** | Play builds carry the same signature as the GitHub APKs | GitHub ↔ Play updates work in place. F-Droid stays separate. |
| B. Let Google generate the app signing key (default) and use a new upload key | Play has its own signature | Play, GitHub and F-Droid all need reinstalls to switch |
| C. Use the existing key as the *upload* key only | Possible, but Google advises keeping upload and signing keys apart | Same as B |

The analyst's recommendation is **option A**. It is the only one that keeps
one existing user group (GitHub users) able to move without a reinstall. It
also means the private signing key is shared with Google. That is a
security and trust trade-off for the maintainer, so it is **flagged**. Either
way, the upload key becomes **new signing material** (new keystore, new CI
secrets if automated). That is also **flagged**.

**G6. Target API level.** From 31 Aug 2026, new apps and updates must target
**Android 16 (API 36)**. The app already targets 36 (`variables.gradle`), so
**nothing is needed now**. Expect the next bump (API 37) around August 2027
and plan for it. [Play: Target API]

**G7. App content declarations in Play Console:**
- *Privacy policy URL* (P3).
- *Data safety form* (§3.1), including the deletion questions and the web
  deletion URL (P1/P2). The form is required even for apps that collect
  nothing. [Play: Data safety] [Play: Account deletion]
- *App access*: login credentials for a reviewer test account (P6).
- *Ads*: none.
- *Content rating* (IARC questionnaire). Answer honestly about user
  interaction/UGC (P5) and health tracking.
- *Target audience*: adults/13+. A "children" audience brings in the
  Families policy.
- *UGC policy* compliance if the social features stay (P5, §6.2).
- *Health apps declaration*: check-in mood/health tracking may trigger the
  health-apps questions. Verify this in the Console.

**G8. Account deletion (hard blocker).** For apps that allow account
creation, Play requires both an **in-app path** to delete the account and
its data *and* a **web link** where users can request deletion without
reinstalling. The web page must name the app/developer as shown on Play.
[Play: Account deletion] This depends on P1/P2 and cannot be done in this
repo.

**G9. Store listing.**
- Title, short description and full description can be reused from `fastlane/metadata/android/en-US` (limits: title 30,
  short 80, full 4000 characters [Play: Store listing]). The full
  description uses F-Droid-style HTML (`<b>`, `<ul>`). How Play renders these
  tags was not verified, so check the listing preview and simplify if
  needed.
- Icon: the 512×512 `icon.png` fits Play's 512×512 32-bit PNG rule.
- **Feature graphic 1024×500 is required**, and none exists. [Play: Preview
  assets]
- **Screenshots: the current ones do not meet Play's rules.** Play needs
  JPEG or 24-bit PNG **without alpha**, with the longest side at most twice
  the shortest. The existing files are RGBA and 518×1149 (ratio 2.22). For
  the recommended placements, Play wants at least 4 screenshots of at least
  1080×1920 (9:16). [Play: Preview assets] The screenshots need to be
  re-shot or re-exported. Changing the files under `fastlane/` also changes
  what F-Droid shows, which is fine, but the maintainer should decide.
- Localization: add de/fr/es listings to match the UI languages (optional).
- Category: Productivity. Contact email and website: `https://solyto.app`.

**G10. Release tracks.** Internal → closed (G3) → apply for production →
production, ideally as a staged rollout. Each upload needs a **higher
`versionCode` than any earlier upload** (§7). `make rerelease` rebuilds the
**same** version, and Play will reject that as a duplicate `versionCode`.
On Play, a fix always needs a new patch version.

**G11. Optional CI automation (flagged: new secrets).** Add a
`bundleRelease` step to `release.yml` and upload with fastlane `supply` or
the Gradle Play Publisher plugin. Either one needs a **Google Cloud service
account JSON key** with Play Console API access as a new GitHub secret, plus
the upload-key secrets from G5. Until the first production release has been
done manually, a manual upload in Play Console is simpler. Gradle Play
Publisher would be a new Gradle plugin, which F-Droid's scanner would see
in `build.gradle`, so keep it out of the F-Droid path. fastlane would run
outside Gradle.

## 5. Apple App Store: ordered steps (TASK-4)

This is the larger and less certain part. There is **no iOS project**, iOS
builds **need macOS**, and none of the iOS steps below has been tried. Read
them as a plan with risks, not as a checked recipe.

**A1. Join the Apple Developer Program.** It costs **99 USD per membership
year**, with local prices shown at checkout. Nonprofits, accredited
education institutions and government entities can ask for a fee waiver.
[Apple: Enroll]
- *Individual*: an Apple Account with two-factor authentication and your
  **legal name**, which is shown publicly as the seller name.
- *Organization*: a legal entity (no DBAs or trade names), a **D-U-N-S
  number**, and an enroller with authority to sign for the entity. The
  organization's name is shown as the seller. [Apple: Enroll]
- The Play account type (G1) and the Apple account type should probably
  match. A D-U-N-S number works for both stores.

**A2. Get a Mac and Xcode.** Since 28 Apr 2026, App Store uploads must be
built with **Xcode 26 or later with the iOS 26 SDK**. Since 9 Sep 2026, apps
must target **iOS 13 or later**. [Apple: Upcoming requirements] Capacitor 7
needs Xcode 16+ and raises the iOS deployment target to **14.0**. [Capacitor
7 update guide] [Capacitor 7 environment setup]
*Open point:* this report did not verify that Capacitor 7 builds cleanly
with Xcode 26. If it does not, the iOS work brings a **Capacitor 8 upgrade**
for Android as well (see §11).
If there is no Mac, the options are hosted macOS CI (A11) or a rented cloud
Mac. Signing, debugging and the first archive are much easier on a local
Mac.

**A3. Add the iOS platform (describe only, not run here).**
1. Add `@capacitor/ios` (same major as `@capacitor/android`, `^7`) to the root
   `package.json` `devDependencies`. *Installing it is a package install, so
   the maintainer has to approve it.*
2. `npx cap add ios`. Capacitor 6+ can use **Swift Package Manager** instead
   of CocoaPods (`npx cap add ios --packagemanager SPM`). For a new project
   with no plugins, SPM avoids the CocoaPods/Ruby toolchain. [Capacitor 7:
   SPM]
3. Commit the generated `ios/` directory, as was done for `android/`.
4. Build the web app as today (`PUBLIC_MOBILE=true npm run build` in
   `frontend/`), then `npx cap sync ios`. Put this in a **separate script**
   (for example `scripts/build-ios.sh`) and keep `build-fdroid.sh` untouched
   (§6.5).

**A4. Bundle ID, signing and capabilities.**
- Register App ID **`app.solyto`** in the developer portal. Its
  availability is not checked here.
- Signing: Apple Development and Apple Distribution certificates plus
  provisioning profiles. Xcode's *automatic signing* handles this for a
  single developer. CI needs either exported certificates/profiles or
  fastlane `match` (flagged as new secrets, A11).
- Capabilities that will probably be needed:
  - **Associated Domains** `webcredentials:my.solyto.app` (and/or
    `solyto.app`) so passkeys can work. This needs an
    `apple-app-site-association` file on that domain (website change).
  - **App Groups** if a Share Extension is built (A5).
  - **Push Notifications** only if native push is built later (§6.4).

**A5. Port the Android-native behaviour.**

| Android today | iOS equivalent | Effort / owner |
|---|---|---|
| `SEND text/plain` → `MainActivity.handleShareIntent` → `https://my.solyto.app/share?q=…` | A **Share Extension** target (Swift). It hands the text to the main app (App Group storage, or by opening the `app.solyto://` URL scheme), and the main app routes the WebView to `/share?q=…`. | Medium. New native code in this repo (`ios/`). Can be left out of the first release. |
| `VIEW app.solyto://…` intent filter (no handler today) | `CFBundleURLTypes` for scheme `app.solyto`. `urls.ts` already maps the mobile deep link to `app.solyto://auth/login` (`getDeepLinkUrl`). | Small. Needs a native handler or `@capacitor/app` (`appUrlOpen`), which is a new package. |
| `PullToRefreshPlugin` + `SwipeRefreshLayout` | A `UIRefreshControl` on the WKWebView's scroll view, with the same "is anything scrolled" gate | Medium. Optional for v1. |
| Edge-to-edge bar colours (`applySystemBarAppearance`) | Safe areas. `app.html` has no `viewport-fit=cover`, and the CSS uses no `env(safe-area-inset-*)`. Choose between Capacitor's `ios.contentInset` setting (config in this repo) and safe-area CSS in `../app` (gated on `IS_MOBILE`). Status bar style should follow the theme. | Small–medium. Needs testing on a notched device. |
| WebView origin `https://my.solyto.app` | On iOS the local scheme **cannot be `https`**. WKWebView reserves http/https, and the default `iosScheme` is `capacitor`, so the origin becomes `capacitor://my.solyto.app`. [Capacitor 7 config] | **Backend:** allow that origin in CORS. **`../app`:** check anything that assumes `https:` (cookies, WebAuthn, the hard-coded share URL). |

**A6. Versioning.** iOS has `CFBundleShortVersionString` (the marketing
version, Xcode `MARKETING_VERSION`) and `CFBundleVersion` (the build number,
`CURRENT_PROJECT_VERSION`). Derive both from root `package.json` the same
way `build-fdroid.sh` does for Android. Marketing version = `1.0.15`. Build
number = the same `versionCode` (`10015`). A new `scripts/build-ios.sh`
would write both into `ios/App/App.xcodeproj/project.pbxproj` with `sed`
(or `agvtool`). Apple rejects a second upload with the same build number for
a version, so, as on Play, a re-upload needs a new patch version (§7).

**A7. App Store Connect record and metadata.**
- New app: platform iOS, name "solyto" (availability not checked), primary
  language, bundle ID `app.solyto`, and a SKU.
- **Privacy policy URL** (required) and **App Privacy "nutrition labels"**.
  Use the same data inventory as §3.1. Apple 5.1.1(i) also requires the
  policy to be **reachable inside the app** (P4). [Apple: Review guidelines]
- **Age rating**: answer the updated age-rating questions (new system since
  31 Jan 2026). [Apple: Upcoming requirements] UGC (P5) affects the answers.
- **Export compliance.** If the app uses only OS-provided encryption (HTTPS
  through WebKit/URLSession), it counts as exempt. Set
  `ITSAppUsesNonExemptEncryption = NO` in `Info.plist` so the question is not
  asked on every upload. Apple also says to set it to NO when "only forms of
  encryption that are exempt" are used. [Apple: Export compliance] The
  maintainer should confirm this, because the passkey/WebAuthn code uses OS
  APIs.
- **Required-reason APIs / privacy manifest.** Since 1 May 2024, uploads must
  declare approved reasons for certain APIs, including those used by SDKs.
  [Apple: Upcoming requirements] Check whether the Capacitor 7 runtime ships
  its own `PrivacyInfo.xcprivacy` or whether the app needs one.
- **EU distribution.** App Store Connect asks for a Digital Services Act
  trader-status declaration for EU storefronts. Traders have their contact
  details shown publicly. Check this in App Store Connect. It is not
  verified against an Apple page in this report.
- **Screenshots.** At least one **iPhone with Dynamic Island (medium
  display)** screenshot (1206×2622 or 1179×2556 portrait), plus **iPad
  13-inch** (2064×2752 or 2048×2732) **if the app supports iPad**. No alpha
  channel. [Apple: Screenshot specs] The Capacitor template targets
  iPhone+iPad by default. Making v1 **iPhone-only** avoids iPad screenshots
  and iPad layout review. None of the Android screenshots can be reused at
  these sizes.
- Description, keywords, support URL and a marketing URL. The fastlane text
  is a starting point, but Apple's description is plain text (no HTML).

**A8. TestFlight.** Upload the archive (Xcode Organizer, `xcodebuild` +
`altool`/Transporter, or fastlane `pilot`). Internal testers (the team) need
no review. External testers need **Beta App Review** first. Use TestFlight
to test passkeys, sharing, safe areas, login against a self-hosted server,
and the account-deletion flow before submitting.

**A9. App Review submission.**
- Provide a **demo account** (P6) and review notes. The notes should
  explain the self-hosting option, that all features are bundled (no remote
  code), and which native features exist.
- The review risks are in §6.1–§6.3: 4.2 minimum functionality, 1.2 UGC,
  5.1.1(v) account deletion, and 2.5.2 self-contained code.
- **Sign in with Apple (4.8) is not required.** 4.8 only applies to apps
  that use a *third-party or social* login for the primary account. solyto
  uses **its own** email/password and passkey accounts (`apiRoutes.auth.*`,
  no OAuth providers found), which is the listed exemption "Your app
  exclusively uses your company's own account setup and sign-in systems".
  [Apple: Review guidelines 4.8]
- In-app account deletion (5.1.1(v)): users must be able to *initiate*
  deletion in the app. Deactivation alone is not enough. A link to a web
  page that completes the deletion is acceptable. [Apple: Account deletion]

**A10. Passkeys / WebAuthn in WKWebView (needs a prototype).** Login and
passkey registration use `@simplewebauthn/browser`
(`routes/auth/login`, `SecuritySettings.svelte`). Inside an app's WKWebView,
WebAuthn depends on the origin (`capacitor://…` instead of `https://…`, see
A5) and on the Associated Domains entitlement for the relying party's
domain. This report **could not confirm** that WebAuthn works in a
Capacitor WKWebView with a custom scheme. Treat it as a TestFlight
prototype item. The fallbacks are: (a) passkeys hidden on iOS
(`../app`, gated on platform), with email/password still working; or (b) a
native passkey plugin based on `ASAuthorizationController` (new
dependency or custom code).

**A11. CI options (flagged: new secrets).**
- **Xcode Cloud**: Apple's hosted CI, configured in App Store Connect. It is
  part of the membership, with a usage limit (not checked).
- **GitHub Actions `macos-*` runners + fastlane** (`match`/`gym`/`pilot`):
  this fits the existing tag-triggered `release.yml`. It needs an **App Store
  Connect API key** and certificate/profile storage as secrets. Run it as a
  separate job or workflow so the Android/F-Droid path does not change.
- Recommendation: do the first releases by hand from Xcode and automate
  once the pipeline is stable.

## 6. Cross-cutting risks and constraints (TASK-5)

These are judgement calls. They are framed as risks for the maintainer to
decide, not as conclusions.

### 6.1 Apple 4.2 "Minimum functionality" (WebView wrappers)

4.2 says an app must "elevate it beyond a repackaged website" and be
"useful, unique, or 'app-like'". [Apple: Review guidelines 4.2]

- **Arguments for solyto:** the web app is **bundled** in the binary
  (`webDir frontend/build`) and is not loaded from a remote URL. It is a
  broad tool with many features (todos, calendar/contacts with DAV,
  notes editor, finances, time tracking, libraries). It has real account
  state, and it supports self-hosting, which a website alone cannot do in
  the same way.
- **Arguments against:** on iOS, the first build would be the same UI as the
  PWA at `my.solyto.app` with **no iOS-native features**. Every Android
  native extra (share target, pull-to-refresh, bar colours) must be rebuilt
  first (A5). Push notifications would not work (§6.4).
- **Mitigations, in order of value:** a Share Extension (A5), native push
  (§6.4), correct safe areas and native-feeling navigation, and later
  widgets (see `docs/reports/android-homescreen-widgets.md`). Write review
  notes that describe the native integration.
- **Risk: medium–high** for the first submission. A 4.2 rejection is common
  for Capacitor apps without native features. It can be appealed or fixed
  by adding native features.

### 6.2 User-generated content (Apple 1.2, Play UGC policy)

Dev-requests (posts, comments, votes), public profiles, friends/friend feeds
and calendar sharing let users see each other's content. Apple 1.2 requires
a way to filter objectionable material, report it, block users, and
published contact info. [Apple: Review guidelines 1.2] Play requires terms
of use accepted before posting, in-app reporting, and blocking for 1:1 or
public interactions. [Play: UGC policy] **None of these was found (P5).**
Options: (a) build report/block plus terms in the backend and `../app`; or
(b) hide dev-requests and public social features in store builds. Option
(b) needs a build or platform flag in `../app` and makes the store builds
different from F-Droid/web. **This is a maintainer decision.**

### 6.3 Self-hosting (custom API URL) and the user-supplied OpenAI key

- **Custom API URL** (`platform.ts`, `routes/setup/+page.svelte`): the user
  picks *which server holds their data*. All code stays the bundled code,
  which makes it the same kind of thing as an email or CalDAV client.
  Apple 2.5.2 forbids downloading code that "introduces or changes features";
  data from a different server is not code. [Apple: Review guidelines 2.5.2]
  **Risk: low.** Make sure the hosted default works for the reviewer (P6).
  The setup screen should not confuse reviewers into thinking a server is
  required.
- **OpenAI API key**: the API route (`users.settings.updateOpenaiApiKey`)
  and the state method (`Auth.svelte.ts`) exist, but
  `lib/components/settings/ConfigureAiTokens.svelte` is **not imported
  anywhere**. The setting is **not reachable in the current UI**. If it is
  turned on later, Apple 5.1.2(i) requires clear disclosure and explicit
  permission before sharing personal data with "third-party AI", and the
  privacy labels / Data safety form must be updated. The store listings say
  "no AI", which matches today's state. **Risk today: none.**
- **Self-update**: `UpdateChecker.svelte` only renders on `PLATFORM ===
  'desktop'`, so the mobile app has no self-update path. This matters
  because Play and Apple both forbid self-updating outside the store.

### 6.4 Push notifications in the app

`service-worker.ts` handles `push` and `notificationclick`, and
`ManagePushNotifications.svelte` subscribes through `pushManager` with a
VAPID key. The store listing lists "Push" as a digest channel.
- **iOS:** WebKit's Web Push is for **Safari and Home Screen web apps**
  (iOS 16.4+). [WebKit: Web Push for web apps] It is not offered to apps that
  embed WKWebView. Expect the toggle **not to work** in an iOS app.
- **Android WebView:** this report did not find official documentation on
  Push API support in Android System WebView. It is likely not supported.
  **Test it on a device** with the current F-Droid build.
- A visible but broken toggle is a review risk (Apple 2.1, completeness).
  Options: hide it on `IS_MOBILE` (`../app`, small), or build native push:
  APNs on iOS (backend change); FCM on Android, which adds Google services
  and **conflicts with F-Droid's no-proprietary-dependency rules** for the
  same build; or UnifiedPush. Telegram and email digests keep working
  either way.

### 6.5 Keep `build-fdroid.sh` and F-Droid unaffected

- `bundleRelease` (G4) is a separate Gradle task that runs in CI only.
  F-Droid's `gradle: yes` build is unchanged.
- iOS build steps go in a **new script** (A3/A6), never into
  `build-fdroid.sh`. That script's `npx cap sync android` only touches
  Android.
- **Adding `@capacitor/ios` to the root `package.json`** means the
  `npm install` in `build-fdroid.sh` also fetches it on F-Droid. It is a JS
  package (Node 20 compatible like the rest of Capacitor 7), and F-Droid
  already does a root `npm install`. Whether F-Droid's scanner objects to
  anything inside `node_modules/@capacitor/ios` was **not verified**. If it
  does, add a `scandelete` entry, which is an **`fdroid/app.solyto.yml`
  change and must be flagged** (§6.9).
- The committed `ios/` directory: with SPM and no plugins, it holds only
  source and project files. Do not commit build output or `Pods/`.
- Fixing P4 by passing `PUBLIC_PRIVACY_URL` etc. in `build-fdroid.sh` keeps
  it offline and Node 20 compatible, but it changes the F-Droid build output
  (the legal menu becomes visible). That is a small, flagged change.

### 6.6 Android developer verification (affects F-Droid and GitHub too)

Independent of Play, Google is rolling out **developer verification for
sideloaded apps on certified devices**. Protections start on
**30 Sep 2026** for apps installed from participating stores in Brazil,
Indonesia, Singapore and Thailand, and roll out globally in **2027**.
[Android developer verification] For open-source stores that **re-sign with
their own key** (F-Droid today), Google's guide says to register the package
name and **add the platform's signing-key fingerprint** taken from the
F-Droid-signed APK. Without this, users must use the "advanced flow" to
install. [Android: Register open-source app]
**Action for the maintainer:** once a verified Play Console (or Android
Developer Console) account exists, register `app.solyto` with **both**
fingerprints: the developer key (GitHub APKs, and Play if option A in G5)
and F-Droid's key. Play registers apps it distributes automatically, but
the F-Droid key still has to be added.

### 6.7 AGPL-3.0 and the App Store (risk, not legal advice)

- The Free Software Foundation's position is that Apple's App Store terms
  ("Usage Rules", device limits, and the ban on redistribution) are
  "further restrictions" that the GPL forbids. Apple removed GNU Go from
  the App Store after the FSF raised this. [FSF: App Store GPL enforcement] AGPL-3.0 §10 has the same
  "no further restrictions" clause.
- **The copyright holder is not bound by their own licence.** They can
  distribute their own code on the App Store under other terms. In this
  repo, all commits (including `frontend/`) are by one author. The
  canonical `../app` history was **not checked**. If `../app` or this repo
  has third-party contributions under AGPL without a CLA, those authors'
  permission (or removing their code) is needed for an App Store build.
- **Third-party runtime dependencies are permissive.** The non-dev
  packages in `frontend/package-lock.json` are MIT, Apache-2.0, ISC,
  BSD-2/3, 0BSD, OFL-1.1 (fonts), Python-2.0 (`argparse`) and
  `(MPL-2.0 OR Apache-2.0)` (`dompurify`). The root lockfile is all
  dev-only (Capacitor, MIT). No GPL/AGPL runtime package was found.
  `@capacitor/ios` is MIT as well.
- Apple allows a **custom EULA** in place of the standard one, but it must
  include Apple's minimum terms (DPLA Schedule 1, Exhibit B). [Apple:
  DPLA] Whether that resolves the AGPL tension is a legal question for the
  maintainer.
- Google Play's terms are not commonly seen as conflicting with the GPL, and
  many GPL apps are on Play. **Risk: low for Play. Medium for Apple only if
  there are third-party AGPL contributors.**

### 6.8 Vendored-frontend workflow

Every JS/UI change in this report (account deletion UI, legal link, push
toggle, passkey gating on iOS, safe-area CSS, report/block, iOS share route)
must be made in **`../app`**, gated on `IS_MOBILE`/`PLATFORM`
(`platform.ts`), and then brought in with `scripts/vendor.sh`. Editing
`frontend/` directly is overwritten on the next vendor run.
**Note:** `IS_MOBILE` does not tell Android and iOS apart. iOS-only
behaviour would need a runtime check (the frontend already reads
`window.Capacitor?.isNativePlatform?.()` in `routes/share/+page.svelte`, and
Capacitor's `getPlatform()` is on the same global) or a new build flag.
Choosing between these belongs in the `../app` work.

### 6.9 Does `fdroid/app.solyto.yml` need to change?

**Not for Play or iOS themselves.** Possible changes, all optional and all
**flagged**:
- A `scandelete` entry for `node_modules/@capacitor/ios`, only if the
  F-Droid scanner objects (§6.5).
- Switching F-Droid to **publish the developer-signed APK** (`Binaries:` +
  `AllowedAPKSigningKeys:`). That needs reproducible builds. It would let
  F-Droid, GitHub and Play (option A) share one signature. Existing F-Droid
  installs, signed with F-Droid's key, would still need one reinstall.
  [F-Droid: Reproducible Builds] This is a separate project.

## 7. Versioning across stores

One source: root `package.json` `version` (now set by the `v*` tag in CI).

| Store | Version string | Build number | How it is set |
|---|---|---|---|
| F-Droid / GitHub APK | `versionName 1.0.15` | `versionCode 10015` | `build-fdroid.sh` (exists) |
| Google Play | same AAB `versionName` | same `versionCode` | `build-fdroid.sh` (exists). `bundleRelease` reads the same `build.gradle`. |
| Apple | `CFBundleShortVersionString` / `MARKETING_VERSION` = `1.0.15` | `CFBundleVersion` / `CURRENT_PROJECT_VERSION` = `10015` | New `scripts/build-ios.sh` with the same `awk` formula |

Using the same `versionCode` on F-Droid and Play is fine because they are
separate distribution channels. Things to watch:

- **No rebuilds of the same version** on either store (G10, A6).
  `make rerelease` only works for GitHub/F-Droid.
- **Formula overflow.** `printf "%d%02d%02d"` assumes MINOR and PATCH ≤ 99.
  For example, 1.0.100 gives `10100`, which collides with 1.1.0. This is not
  urgent, but both stores reject a `versionCode`/build number that does not
  increase.

## 8. Phased plan

| Phase | Content | Gate to the next phase |
|---|---|---|
| 0. Decisions | Account type (personal vs organization), Play signing option (G5), what to do with UGC features (§6.2) and push (§6.4), iPhone-only vs iPad | Answers to §11 |
| 1. Fix the blockers (outside this repo) | Account deletion endpoint + in-app flow + web page (P1/P2). Privacy policy page + in-app link (P3/P4). Terms + report/block, or hide UGC (P5). Hide the push toggle on mobile. Demo account (P6). | Shipped in `../app` + backend, vendored into this repo |
| 2. Play account + closed test | G1–G3. Build an AAB by hand (G4). Set up signing (G5). Fill in the content forms (G7). New screenshots + feature graphic (G9). Register the F-Droid key under developer verification (§6.6). | 12 testers × 14 days (personal account) |
| 3. Play production | Apply for production access, then a staged rollout (G10). Optional CI upload (G11). | Live on Play |
| 4. iOS project | Mac/Xcode (A2). `@capacitor/ios` + `npx cap add ios` (A3). Bundle ID/signing (A4). Safe areas, URL scheme, CORS for `capacitor://` (A5). Versioning script (A6). Passkey prototype (A10). | Runs on a device |
| 5. TestFlight | Internal testing, then external testing after Beta App Review (A8). App Store Connect metadata, privacy labels, age rating, export compliance, screenshots (A7). Share Extension if it is in scope for v1 (A5). | Stable build, all A7 metadata done |
| 6. App Store | Submit with review notes + demo account (A9). Handle any 4.2/1.2 feedback (§6.1/§6.2). Optional CI (A11). | Live on the App Store |

Phases 2–3 do not depend on phases 4–6. Play can launch first.

## 9. Costs and accounts needed

| Item | Cost | Notes |
|---|---|---|
| Google Play Console | **US$25 one-time** | [Play: Register account] |
| Apple Developer Program | **99 USD / year** (prices vary by region) | Fee waiver only for nonprofits, education and government. [Apple: Enroll] |
| D-U-N-S number | Free | Organization accounts only, on both stores |
| Mac with Xcode 26+ | Hardware, if none is available | Or a cloud Mac / hosted macOS CI |
| Hosted macOS CI (optional) | Usage-based. Not checked. | GitHub `macos-*` runners or Xcode Cloud |
| Testers | Time | ≥12 for 14 days (Play, personal account). TestFlight testers. |
| New secrets (flagged) | — | Play upload key (G5), Play service-account JSON (G11), Apple distribution cert/profiles or `match` repo, App Store Connect API key (A11) |
| Website/legal | Effort | Privacy policy page, account-deletion page, terms of use, `apple-app-site-association` |

## 10. Work split by repo

| Where | Work |
|---|---|
| **This repo (`mobile`)** | AAB build in CI (G4/G11, flagged). Play signing setup (G5, flagged). New screenshots + feature graphic + optional de/fr/es listings under `fastlane/` (G9). `@capacitor/ios` + `ios/` project (A3, package install needs approval). iOS native code: Share Extension, URL scheme, pull-to-refresh, safe-area config (A5). `scripts/build-ios.sh` (A6). Optionally pass the `PUBLIC_*_URL` legal links in `build-fdroid.sh` (P4, flagged). Optionally `allowBackup` rules (§3.1). F-Droid yml only if needed (§6.9, flagged). |
| **`../app` (canonical frontend)** | Account deletion UI (P1). Permanent privacy/legal link on mobile (P4). Terms acceptance at registration + report/block UI, or hiding UGC features (P5). Hide the push toggle on mobile (§6.4). iOS gating for passkeys if needed (A10). Safe-area CSS (A5). Anything that assumes the `https:` origin (A5). |
| **Backend (solyto API)** | Account + data deletion endpoint (P1). Report/block/moderation endpoints (P5). CORS for `capacitor://my.solyto.app` (A5). WebAuthn RP/origin settings for the iOS origin (A10). Native push (APNs/UnifiedPush) if chosen (§6.4). |
| **Website (`solyto.app`)** | Privacy policy page (P3). Account-deletion request page (P2). Terms of use (P5). `apple-app-site-association` (A4). Support/contact page. |
| **Store consoles (maintainer)** | Accounts, identity verification, developer-verification key registration (§6.6), Data safety / privacy labels, ratings, listings, testers. |

## 11. Open questions for the maintainer

1. **Personal or organization account?** Organization skips Play's 12×14
   closed test but needs a legal entity and a D-U-N-S number (G1, A1).
2. **Play signing:** upload the existing key to Google (option A, GitHub ↔
   Play updates keep working) or let Google generate one (G5)?
3. **UGC features** (dev-requests, public profiles, friend feeds): build
   moderation, or hide them in store builds (§6.2)?
4. **Push:** hide it in the apps, or invest in native push (and which
   provider, given F-Droid) (§6.4)?
5. **Is a Mac available?** If not, which hosted option (A2, A11)?
6. **Capacitor 8:** is upgrading before the iOS work acceptable if
   Capacitor 7 does not build with Xcode 26 (A2)? This also affects Android.
7. **iPhone-only for v1**, or iPhone + iPad (A7)?
8. **Share Extension** in the first iOS release, or later (A5, §6.1)?
9. **Monetization:** does the app stay free with no donations or paid tiers?
   Any in-app payment or tip link brings in Apple 3.1.1 / Play Billing
   rules. Nothing like that was found in the code today.
10. **Contributors to `../app`:** are there third-party copyright holders
    who would need to agree to App Store distribution (§6.7)?
11. **Do passkeys work in the current Android app?** Not tested here. The
    answer helps judge the iOS risk (A10).
12. Should `allowBackup` stay `true`, given that it may include the auth
    token (§3.1)?

## 12. Sources

All accessed on 2026-10-17.

- [Play: Testing requirements] Play Console Help, "App testing requirements for new personal developer accounts". https://support.google.com/googleplay/android-developer/answer/14151465
- [Play: Register account] Play Console Help, "Get started with Play Console". https://support.google.com/googleplay/android-developer/answer/6112435
- [Play: Verify identity] Play Console Help, "Verify your developer identity information". https://support.google.com/googleplay/android-developer/answer/10841920
- [Play: Target API] Play Console Help, "Target API level requirements for Google Play apps". https://support.google.com/googleplay/android-developer/answer/11926878
- [Play: Account deletion] Play Console Help, "Understanding Google Play's app account deletion requirements". https://support.google.com/googleplay/android-developer/answer/13327111
- [Play: Data safety] Play Console Help, "Provide information for Google Play's Data safety section". https://support.google.com/googleplay/android-developer/answer/10787469
- [Play: App signing] Play Console Help, "Use Play App Signing". https://support.google.com/googleplay/android-developer/answer/9842756
- [Play: Preview assets] Play Console Help, "Add preview assets to showcase your app". https://support.google.com/googleplay/android-developer/answer/9866151
- [Play: Store listing] Play Console Help, "Create and set up your app" (store listing character limits). https://support.google.com/googleplay/android-developer/answer/9859152
- [Play: UGC policy] Play Console Help, "User Generated Content". https://support.google.com/googleplay/android-developer/answer/9876937
- [Android: App bundles] Android Developers, "About Android App Bundles". https://developer.android.com/guide/app-bundle
- [Android developer verification] Android Developers. https://developer.android.com/developer-verification
- [Android: Register open-source app] Android Developers, "Register your app on open source platforms". https://developer.android.com/developer-verification/guides/open-source-app-registration
- [F-Droid: Reproducible Builds] https://f-droid.org/docs/Reproducible_Builds/
- [Apple: Review guidelines] App Store Review Guidelines (1.2, 2.1, 2.5.2, 3.1.1, 4.2, 4.8, 5.1.1, 5.1.2). https://developer.apple.com/app-store/review/guidelines/
- [Apple: Account deletion] "Offering account deletion in your app". https://developer.apple.com/support/offering-account-deletion-in-your-app/
- [Apple: Enroll] Apple Developer Program enrollment. https://developer.apple.com/programs/enroll/
- [Apple: Upcoming requirements] https://developer.apple.com/news/upcoming-requirements/
- [Apple: Screenshot specs] App Store Connect Help, "Screenshot specifications". https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications
- [Apple: Export compliance] "Complying with encryption export regulations". https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations
- [Apple: DPLA] Apple Developer Program License Agreement, Schedule 1 §3.2 (custom EULA) and Exhibit B. https://developer.apple.com/support/terms/apple-developer-program-license-agreement/
- [Apple: Standard EULA] https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
- [Capacitor 7 environment setup] https://capacitorjs.com/docs/v7/getting-started/environment-setup
- [Capacitor 7 update guide] https://capacitorjs.com/docs/v7/updating/7-0
- [Capacitor 7: SPM] https://capacitorjs.com/docs/v7/ios/spm
- [Capacitor 7 config] (`server.iosScheme`) https://capacitorjs.com/docs/v7/config
- [WebKit: Web Push for web apps] https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- [FSF: App Store GPL enforcement] https://www.fsf.org/blogs/licensing/more-about-the-app-store-gpl-enforcement
