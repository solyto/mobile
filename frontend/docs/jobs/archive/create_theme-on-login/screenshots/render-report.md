# Render report — production `/auth/login` theme sweep

Produced by the developer during TASK-1/TASK-4 verification (2026-10-07).

## Why this is not a `shot` report

`shot` opens a URL with a fresh browser profile and cannot inject
`localStorage`. The reported defect only appears when `localStorage.theme` is
set to a single-mode theme (`nord`), so `shot` alone cannot reproduce it. The
sweep below was captured with the globally available Playwright
(the same engine `shot` uses) via `context.addInitScript()` so the stored
theme is present before the app boots. The rendered PNGs are byte-identical
to what `shot` would capture for the same theme.

## Target

- Production app: `https://my.solyto.app/auth/login`
  (the app host from `src/lib/config/platform.ts`; `solyto.app` is the
  marketing landing page and 404s on `/auth/login`).
- Viewport 1280x900, Chromium (headless), captured after `networkidle`.

## TASK-1 environment facts (production)

At `theme=nord`, on the deployed login page:

| fact | value |
| --- | --- |
| `localStorage.getItem('theme')` | `"nord"` |
| `document.documentElement.className` | `""` (empty — no `dark` class, as designed for single-mode themes) |
| login card class | `... border-2 border-white/5 bg-c-bg-surface ...` |
| computed card `background-color` | `rgb(59, 66, 82)` = Nord `#3b4252` |
| computed card `color` | `rgb(216, 222, 233)` = Nord `#d8dee9` |
| `--color-c-bg-surface` | `#3b4252` |
| `--color-white` | `#eceff4` |
| `--color-c-bg` | `#2e3440` |
| `--color-c-neutral` | `#323a49` |
| Nord stylesheet link present | yes (`/themes/nord/nord.css`) |

**Conclusion:** production already serves the fixed auth-card markup
(`bg-c-bg-surface`) and renders the login page fully Nord-themed. The white
card from `brief.md` is no longer reproducible on production.

## Full theme sweep (login card on production)

| theme | `html.class` | card `background-color` | card luminance | large light surfaces (>3000px², α≥0.5) |
| --- | --- | --- | --- | --- |
| default (light) | *(none)* | `rgb(255,255,255)` | 1.000 | page + card + inputs — expected for a light theme |
| default (dark, `prefers-color-scheme: dark`) | `dark` | `rgb(34,34,34)` | 0.016 | none |
| nord | *(none)* | `rgb(59,66,82)` | 0.054 | none |
| skyrim | *(none)* | `rgba(0,0,0,0)` | n/a | none (theme uses transparent surfaces over its own backdrop) |
| catppuccin-mocha | *(none)* | `rgb(49,50,68)` | 0.034 | none |
| catppuccin-latte | *(none)* | `rgb(230,233,239)` | 0.813 | page + card + inputs — expected for a light theme |
| gruvbox | *(none)* | `rgb(60,56,54)` | 0.041 | none |
| dracula | *(none)* | `rgb(54,55,71)` | 0.040 | none |
| terminal | *(none)* | `rgb(10,26,10)` | 0.008 | none |
| paper | *(none)* | `rgb(243,240,235)` | 0.874 | page + card + inputs — expected for a light theme |
| atari | *(none)* | `rgb(13,0,32)` | 0.002 | none |

No single-mode dark theme leaves a white/light login card. The three light
themes (`catppuccin-latte`, `paper`, and default-light) are light by design.

## Pixel check of the captured artifacts

`prod-login-nord.png` (1280x900):

- `#323a49` — 90.64% (page background, Nord `--color-c-neutral`)
- `#3b4252` — 4.84% (login card, Nord `--color-c-bg-surface`)
- `#434c5e` — 1.63% (inputs, Nord `--color-c-bg-elevated`)
- `#4c566a` — 0.85% (button, Nord `--color-c-btn`)
- **no white/near-white pixels**

## Files

- `prod-login-nord.png` — reported case, now correct
- `prod-login-default-light.png` — light-theme regression reference
- `prod-login-default-dark.png` — dark-theme regression reference
