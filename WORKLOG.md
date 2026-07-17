# Atlas — Work Log


Last updated: July 17, 2026

---

## What Atlas is

A weekly, magazine-style marketing digest in a bold monochrome "Swiss editorial" look. Two parallel sections share one brand and one repo:

- **Trends** — the weekly Marketing Trends Digest (news, data, and a "how to act" takeaway per story).
- **Creative** — a weekly shortlist of standout marketing creative, shown with a short craft-based read on why each works.

Tagline: **Move the world.**

---

## Site structure

```
/                     Homepage — hero + issue index (Trends)
/about                About page
/brand                Brand guide (self-contained, own <style>)
/creative             Creative landing + edition index
/creative/YYYY-MM-DD  Individual Creative editions
/issues/YYYY-MM-DD    Individual Trends issues
/assets               site.css, hero-motion.js, marks-motion.js, marks/, share/
/templates            issue.html, creative.html (scaffolds for new editions)
/scripts              new-issue.sh, new-creative.sh (scaffolders)
```

Six Trends issues published: 2026-05-04, 05-18, 05-25, 06-15, 06-22, 07-06.
One Creative edition published: 2026-07-06 ("The First Cut").

---

## Brand system

- **Wordmark:** ATLAS set in **Bowlby One SC** (big, chunky). Explored futurism / cassette-futurism and an "S-tail underline" direction before landing on Bowlby.
- **Logo lockup:** globe mark left of the wordmark, ~proportional gap (`.214em`), globe centered on the ATLAS line at `1.16em` height. Ink (light-bg) and reversed (dark-bg) versions via `currentColor`.
- **Publication line + tagline:** "Marketing Trends Digest" and the teal "Move the world."
- **Type:** Bowlby One SC (wordmark + issue titles), Archivo Black (section headings, stat figures, numbers), Archivo (body, deks, kickers).
- **Color tokens:** ink `#141414`, paper `#FBFAF7`, muted, rule, hair `#d8d6cf`, teal `#0F6E63` (everyday signal), red `#D63F2F` (rare — Subscribe, "New," alerts).
- **Mark family:** globe + a set of secondary marks (concentric, offset, eclipse, graticule, hatch, reticle, halftone, favicon) as an inline SVG `<symbol>` sprite.
- **Brand guide** at `/brand` documents the whole system: logo family, clear space, color, type scale, components, and usage rules.
- **Brand voice guidelines** generated and saved. Voice rules include: no "quiet/quietly," no "it's not X, it's Y" antitheses, no fabricated campaigns, plain verbs, title-explaining deks, "TL;DR" labeling.

---

## Motion

- **Homepage hero globe (`hero-motion.js`):** scroll-driven. The globe stays fixed in the hero and disassembles piece-by-piece (each ring peels one at a time), then reassembles in the bottom-right corner. Color eases from light to the theme's ink; theme-aware so it lands correctly on light or dark content. Disabled under 900px and honors reduced-motion.
- **Per-issue background marks (`marks-motion.js`):** each issue animates a different mark (offset, concentric, eclipse, graticule, hatch, reticle). The **eclipse** does a full-page color flip near the end of scroll — now reversed in dark mode (flips from the current theme's colors to their inverse) and clears its override at rest.

---

## Content work

- Extracted content from 5 source digest .docx files plus a 6th issue, rewrote each into Atlas voice, and built the six issue pages from the template.
- Voice pass across all six issues: title-explaining deks, "TL;DR" relabel, removed AI-tell antitheses / "quiet killer" / "quietly" / em-dash fragments, and removed senior-living internal references (flagged for re-sourcing).
- Built the homepage issue index and validated.

---

## Creative digest

- Full parallel automation mirroring Trends: `EDITIONS` array + dated pages + `templates/creative.html` + `scripts/new-creative.sh`.
- Same hero header as Trends; hybrid visual + text format.
- Real image **and** YouTube-video embedding (`youtube-nocookie.com` iframes).
- Craft-breakdown cards per pick: **Agency · Motivation · Emotion · Typeface · Palette** (with color swatches) + a "Steal it" take and a "See the work" link.
- First edition "The First Cut" (2026-07-06): Columbia, Club Deportivo Municipal / McCann Lima, SAP / BBDO, Pinterest / House of Creative.
- Weekly scheduled shortlist task (Mondays 8am) that scans brand film / social / OOH / B2B lanes.

---

## Site-wide features

- **Universal footer** on every page with identical spacing (brand, nav, tagline, base line).
- **Subscribe badge** — Signal-Red outline with a dot, in a fixed top-right control cluster. Still a placeholder (`href="#subscribe"`) until a real signup URL exists — not to be pushed live as a working link before then.
- **Dark mode toggle** — flips ink/paper site-wide, persists in `localStorage`, no-flash pre-paint script. The dark hero band stays dark in both themes (scopes its own tokens). Toggle appears in the footer and the top-right cluster.
- **Hamburger menu** — fixed top-left button that animates into an X and slides out a left drawer (with overlay, Esc-to-close, link-click-to-close) containing the section links, Subscribe, and the tagline. Theme-aware.

---

## Sources & citations (plagiarism / credibility)

- Every source in all six Trends issues now **links back to the real article** — both the per-story "Sources" line and the bottom "Sources appendix."
- All URLs were verified against live web search results; none were fabricated. The issue template now carries the linked-source pattern by default.
- **Flagged for review:**
  - Best-match rather than certain (publisher ran near-identical posts): Mailbird "Email Authentication Crisis 2026" (05-04), Creating Results 2026 trends (05-04, 05-18), TechBuzz Perplexity shopping (06-22).
  - Profound "Aim" (07-06) links to the Yahoo Finance / GlobeNewswire-syndicated copy; the original wire URL didn't surface.
  - Three trend sources are senior-living industry blogs (Creating Results, Conversion Logix, Distinctive Living) — real citations, but candidates to swap for broader sources.
  - `[Flag]` notes in 06-15, 06-22, 07-06 are reminders, not sources, and remain unlinked.
- **Open follow-up:** a pass to confirm each headline statistic matches the specific number in its linked source.

---

## Publishing flow

New Trends issue: run `scripts/new-issue.sh`, fill the template, add an entry to the top of the `ISSUES` array in `index.html`, commit and push (Vercel redeploys).
New Creative edition: same via `scripts/new-creative.sh` and the `EDITIONS` array in `creative/index.html`.

---

## Known open items

- Subscribe is a placeholder — wire to a real newsletter platform before going live.
- Confirm the medium-confidence source links noted above.
- Optional: swap senior-living trend sources for general-market equivalents.
- Optional: verify headline stats against their linked sources.
