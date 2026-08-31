# Render report: http://127.0.0.1:8199/prod/

- captured: 2026-08-18T19:17:29.633Z
- widths: 1280

## Findings — errors

- **[contrast]** pre "19:17:29.071  page controlled by service": contrast 1.43:1 — fails WCAG AA (needs 4.5:1)

## Viewport 1280px

- viewport: 1280×900, DPR 1
- document: 1280×900 (client 1280px)
- fonts: loaded
- spacing scale: n/a

### Element inventory

| element | text | rect | font | contrast |
|---|---|---|---|---|
| h1 | "Run 1 — production service wor" | 24,24 1232×25 | 22px 700 | 18.88:1 AA/AAA |
| p.sub | "Cross-origin profile image ; s" | 24,53 1232×19 | 16px 400 | 7.46:1 AA/AAA |
| code | "http://127.0.0.1:8299/storage/" | 235,56 329×15 | 13px 400 | 7.46:1 AA/AAA |
| div#verdict | "PICTURE BROKEN (no retry, stay" | 24,88 1232×69 | 30px 800 | 6.54:1 AA/AAA |
| div.entry | "profile entry" | 24,173 73×84 | 12px 400 | 7.46:1 AA/AAA |
| div.entry | "same-origin control" | 109,173 117×84 | 12px 400 | 7.46:1 AA/AAA |
| pre#log | "19:17:29.071  page controlled " | 24,273 1232×208 | 13px 400 | 1.43:1 FAIL |
