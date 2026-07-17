# Atlas — Marketing Trends Digest

**Move the world.**

A weekly digital newsletter on marketing best practices and emerging trends, with a
practical, act-on-it takeaway for every item. Built in Josh's Swiss-editorial house style —
monochrome, Archivo Black display type, hairline rules.

**Live:** deploys automatically on Vercel on every push to `main`.

## Structure

```
/index.html                     ← Trends homepage: indexes every issue (auto-rendered from a list)
/issues/2026-07-06/index.html   ← one Trends issue = one page (the weekly digest)
/creative/index.html            ← Creative homepage: indexes every edition (auto-rendered from a list)
/creative/2026-07-06/index.html ← one Creative edition = one page (the weekly picks)
/about/index.html               ← about page
/brand/index.html               ← brand guide
/assets/site.css                ← shared editorial stylesheet (every page)
/vercel.json                    ← clean URLs, no trailing slashes
/templates/issue.html           ← canonical Trends issue skeleton (dev only, not deployed)
/templates/creative.html        ← canonical Creative edition skeleton (dev only, not deployed)
/scripts/new-issue.sh           ← scaffolds a new Trends issue folder (dev only, not deployed)
/scripts/new-creative.sh        ← scaffolds a new Creative edition folder (dev only, not deployed)
```

Atlas runs **two parallel weekly digests** under one brand: **Trends** (`/`, what moved in
marketing + how to act) and **Creative** (`/creative`, the week's best work + why it lands, in a
visual card format). Both share the header, stylesheet, and publishing pattern.

`templates/` and `scripts/` are kept in the repo but excluded from the live site via
`.vercelignore`.

- **One issue = one page.** Each week is its own page under `/issues/YYYY-MM-DD/`, served at a
  clean URL like `/issues/2026-07-06`.
- **The homepage indexes issues automatically** from a small `ISSUES` array in `index.html`.
- **No build step.** Plain static files; Vercel serves them as-is and redeploys on push.

## Publish a new weekly issue

Three steps, ~2 minutes:

1. **Scaffold the issue page.** From the repo root:
   ```
   ./scripts/new-issue.sh 2026-07-13
   ```
   This copies `templates/issue.html` → `issues/2026-07-13/index.html` and prints the snippet
   for step 2. Then fill it in — the fastest way is to run the **`josh-editorial-style` skill**
   on the week's digest: it outputs the issue HTML using these exact classes and the shared
   `/assets/site.css`, so you paste it straight into the new file. (Hand-edit alternative:
   replace each `{{PLACEHOLDER}}`, duplicate the `<section class="item">` block per item, and
   update the `.toc` nav so its `data-target`s match the section `id`s.)

2. **Add it to the homepage index.** In `index.html`, add one entry to the **top** of the
   `ISSUES` array:
   ```js
   {
     num: "02",
     date: "Week of Jul 13, 2026",
     href: "/issues/2026-07-13",
     title: "One-line headline for the week",
     dek: "A short standfirst summarizing the week.",
     items: ["Item 1 headline", "Item 2 headline", "…"]
   }
   ```

3. **Commit & push.**
   ```
   git add -A && git commit -m "Add issue: Week of Jul 13, 2026" && git push
   ```
   Vercel redeploys automatically in ~30 seconds. The homepage now lists the new issue and the
   page is live at its clean URL.

## Publish a new Creative edition

Same pattern as Trends, in `/creative`:

1. **Scaffold the edition page.**
   ```
   ./scripts/new-creative.sh 2026-07-13
   ```
   Copies `templates/creative.html` → `creative/2026-07-13/index.html`. Then fill it in: replace
   each `{{PLACEHOLDER}}`, and duplicate the `<div class="cpick">` block once per pick. For a real
   image, drop the file into `creative/2026-07-13/` and swap the placeholder `<svg>` inside `.shot`
   for `<img src="…" alt="…">`. Keep it to a handful — same bar as Trends: it has to be worth
   stealing from.

2. **Add it to the Creative index.** In `creative/index.html`, add one entry to the **top** of the
   `EDITIONS` array (`num`, `date`, `href`, `title`, `dek`, `picks` count).

3. **Commit & push** — Vercel redeploys automatically.

## Design system

Swiss-editorial, monochrome. Ink `#141414` on warm paper `#FBFAF7`, `Archivo Black` for display
type (uppercase, tight tracking), `Archivo` for body, hairline rules, oversized section numbers,
black/bordered stat callouts, and a client-agnostic "How to act" takeaway that closes each item.
All styling lives in `/assets/site.css`; see the `josh-editorial-style` skill for the full spec.

**Accent color** (used sparingly): Atlas Green `#1D9E75` is the everyday signal — active nav, one
inline link, one standout figure, the live dot. Signal Red `#D63F2F` is held back for rare
"new/alert" moments. Tokens: `--green`, `--green-deep`, `--green-pale`, `--red` in `site.css`.

**Logo** — the Atlas wireframe globe. Marks live in `/assets/marks/`:
`atlas-mark.svg` (primary), `atlas-mark-reversed.svg` (on ink), `favicon.svg` (heavier, small
sizes), plus six single-job secondaries: `atlas-offset`, `atlas-eclipse`, `atlas-graticule`,
`atlas-hatch`, `atlas-halftone`, `atlas-reticle`.

**Motion:** each issue page gets one scroll-driven animation that resolves into an Atlas mark
in the bottom-right corner, assigned deterministically by the issue's date (`data-issue` on
`#markmotion`), so the digest varies week to week. Four are live: a lens-flare that settles into
the offset contour stack; a scattered grid of dots that collects into concentric rings; an eclipse
(a page-sized soft shadow that shrinks into the corner and, in the final stretch, flips the whole
page to a negative by swapping `--ink`/`--paper`); and a graticule (an aperture vortex of curved
lines that spins, pulls in, and resolves — arcs into the outline, lines into meridians and
latitudes); and an engraved hatch (thick blurred lines that come into focus one by one and spin
clockwise, falling into the corner as the hatch); and a reticle (a gray, soft-focus scope that
sharpens and shrinks into the corner, locking on). On-page marks use the `--ink`/`--paper` tokens so
they invert with the eclipse flip. All six secondary-mark animations are live. Code in `assets/marks-motion.js`,
styled via `.markmotion` in `site.css`. Disabled
under 1200px, honors `prefers-reduced-motion`, and holds a quiet static mark on pages too short
to scroll. Standalone explorations live in `experiments/`.

**Brand guide:** the full guide — mark family, clear space, color rules, type, layout, do/don't —
is a page at [`/brand`](/brand) (`brand/index.html`).

## Deploy (first-time / re-connect)

Already connected to Vercel. If you ever need to reconnect: import the GitHub repo at
[vercel.com/new](https://vercel.com/new) — it auto-detects a static site, no build command
needed. Add a custom domain (e.g., `digest.vinylmarketing.com`) under Project Settings → Domains.
