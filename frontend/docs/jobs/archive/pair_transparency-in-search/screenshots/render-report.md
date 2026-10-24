# Render report: http://localhost:5173/auth/dev-preview-search?dark=1

- captured: 2026-08-31T18:41:41.972Z
- widths: 1280

## Findings — errors

- **[contrast]** span "Library header (varied background)": contrast 1:1 — fails WCAG AA (needs 4.5:1)
- **[contrast]** span "Contacts header (varied background)": contrast 1:1 — fails WCAG AA (needs 4.5:1)
- **[overflow]** div.absolute.z-30: internal-horizontal-overflow: scrollWidth 345 > clientWidth 339 (overflow-x: visible)
- **[overflow]** div.absolute.top-6: internal-horizontal-overflow: scrollWidth 345 > clientWidth 339 (overflow-x: visible)

## Findings — warnings

- **[overlap]** span.text-white"Library header (varied background)" × div.absolute.z-30: rects overlap 100% of the smaller (z-index 0 vs 30)
- **[overlap]** span.text-white"Library header (varied background)" × input.w-0.rounded-xl: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** button.cursor-pointer × div.absolute.z-30: rects overlap 100% of the smaller (z-index 0 vs 30)
- **[overlap]** button.cursor-pointer × input.w-0.rounded-xl: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** button.cursor-pointer × button.z-20.ml-[-30px]: rects overlap 100% of the smaller (z-index 0 vs 20)
- **[overlap]** button.cursor-pointer × svg: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** svg × div.absolute.z-30: rects overlap 100% of the smaller (z-index 0 vs 30)
- **[overlap]** svg × input.w-0.rounded-xl: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** svg × button.z-20.ml-[-30px]: rects overlap 100% of the smaller (z-index 0 vs 20)
- **[overlap]** svg × svg: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** input.w-0.rounded-xl × button.z-20.ml-[-30px]: rects overlap 100% of the smaller (z-index 0 vs 20)
- **[overlap]** input.w-0.rounded-xl × svg: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** span.text-white"Contacts header (varied background)" × div.absolute.top-6: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** span.text-white"Contacts header (varied background)" × input.w-0.rounded-xl: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** button.cursor-pointer.max-md:hidden × div.absolute.top-6: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** button.cursor-pointer.max-md:hidden × input.w-0.rounded-xl: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** button.cursor-pointer.max-md:hidden × button.z-20.ml-[-30px]: rects overlap 100% of the smaller (z-index 0 vs 20)
- **[overlap]** button.cursor-pointer.max-md:hidden × svg: rects overlap 96% of the smaller (z-index 0 vs 0)
- **[overlap]** svg × div.absolute.top-6: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** svg × input.w-0.rounded-xl: rects overlap 100% of the smaller (z-index 0 vs 0)
- **[overlap]** svg × button.z-20.ml-[-30px]: rects overlap 100% of the smaller (z-index 0 vs 20)
- **[overlap]** svg × svg: rects overlap 96% of the smaller (z-index 0 vs 0)
- **[overlap]** input.w-0.rounded-xl × button.z-20.ml-[-30px]: rects overlap 100% of the smaller (z-index 0 vs 20)
- **[overlap]** input.w-0.rounded-xl × svg: rects overlap 100% of the smaller (z-index 0 vs 0)

## Viewport 1280px

- viewport: 1280×900, DPR 1
- document: 1280×900 (client 1280px)
- fonts: loaded
- spacing scale: 64

### Element inventory

| element | text | rect | font | contrast |
|---|---|---|---|---|
| span.text-white | "Library header (varied backgro" | 502,68 244×24 | 16px 400 | 1:1 FAIL |
| button.cursor-pointer | (interactive) | 770,68 24×24 | 16px 400 | — |
| input.w-0 | (interactive) | 455,57 345×46 | 20px 400 | — |
| button.z-20 | (interactive) | 770,57 24×46 | 16px 400 | — |
| span.text-white | "Contacts header (varied backgr" | 487,228 259×24 | 16px 400 | 1:1 FAIL |
| button.cursor-pointer | (interactive) | 770,228 24×24 | 16px 400 | — |
| input.w-0 | (interactive) | 455,216 345×46 | 20px 400 | — |
| button.z-20 | (interactive) | 770,216 24×46 | 16px 400 | — |
