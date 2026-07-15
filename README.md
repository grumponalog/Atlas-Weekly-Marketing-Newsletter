# Atlas — Marketing Trends Digest

**Move the world.**

A weekly digital newsletter on marketing best practices and emerging trends, with a
practical, act-on-it takeaway for every item. Built in Josh's Swiss-editorial house style —
monochrome, Archivo Black display type, hairline rules.

**Live:** deploys automatically on Vercel on every push to `main`.

## Structure

```
/index.html                     ← homepage: indexes every issue (auto-rendered from a list)
/issues/2026-07-06/index.html   ← one issue = one page (the weekly digest)
/assets/site.css                ← shared editorial stylesheet (homepage + all issues)
/vercel.json                    ← clean URLs, no trailing slashes
/templates/issue.html           ← canonical issue skeleton (dev only, not deployed)
/scripts/new-issue.sh           ← scaffolds a new issue folder (dev only, not deployed)
```

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

## Design system

Swiss-editorial, monochrome. Ink `#141414` on warm paper `#FBFAF7`, `Archivo Black` for display
type (uppercase, tight tracking), `Archivo` for body, hairline rules, oversized section numbers,
black/bordered stat callouts, and a client-agnostic "How to act" takeaway that closes each item.
All styling lives in `/assets/site.css`; see the `josh-editorial-style` skill for the full spec.

**Accent color** (used sparingly): Atlas Teal `#0F6E63` is the everyday signal — active nav, one
inline link, one standout figure, the live dot. Signal Red `#D63F2F` is held back for rare
"new/alert" moments. Tokens: `--teal`, `--teal-deep`, `--teal-pale`, `--red` in `site.css`.

**Logo** — the Atlas wireframe globe. Marks live in `/assets/marks/`:
`atlas-mark.svg` (primary), `atlas-mark-reversed.svg` (on ink), `favicon.svg` (heavier, small
sizes), plus six single-job secondaries: `atlas-offset`, `atlas-eclipse`, `atlas-graticule`,
`atlas-hatch`, `atlas-halftone`, `atlas-reticle`.

**Motion:** on issue pages, a scattered grid of dots collects into the Atlas mark (a dot-grid
disc inside a fading-in ring) in the bottom-right corner as the reader scrolls — `assets/dots.js`,
styled via `.dotfield` / `.dotcollector` in `site.css`. Disabled under 1200px, honors
`prefers-reduced-motion`, and holds a quiet static mark on pages too short to scroll.

**Brand guide:** the full guide — mark family, clear space, color rules, type, layout, do/don't —
is a page at [`/brand`](/brand) (`brand/index.html`).

## Deploy (first-time / re-connect)

Already connected to Vercel. If you ever need to reconnect: import the GitHub repo at
[vercel.com/new](https://vercel.com/new) — it auto-detects a static site, no build command
needed. Add a custom domain (e.g., `digest.vinylmarketing.com`) under Project Settings → Domains.
