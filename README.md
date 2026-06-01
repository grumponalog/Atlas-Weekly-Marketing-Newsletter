# Vinyl Marketing — Trends Digest

A weekly digital newsletter on marketing best practices and emerging trends, with client-specific application ideas for Vinyl Marketing accounts.

## What's in this repo

- `index.html` — The current issue (Week of May 25, 2026). Self-contained, single file. No build step.
- `vercel.json` — Minimal Vercel config (clean URLs, no trailing slashes).

## Deploy to Vercel (first time)

### Option A — From GitHub (recommended)

1. Create a new GitHub repo (e.g., `vinyl-trends-digest`).
2. Drop `index.html`, `vercel.json`, and this `README.md` into the repo. Commit and push.
3. Go to [vercel.com/new](https://vercel.com/new) and "Import" the repo.
4. Vercel auto-detects it as a static site. Hit Deploy. Done in ~30 seconds.
5. Vercel gives you a `vinyl-trends-digest.vercel.app` URL right away. Add a custom domain (e.g., `digest.vinylmarketing.com`) in Project Settings → Domains.

### Option B — Direct upload (no GitHub)

1. Install Vercel CLI: `npm i -g vercel`
2. From this folder, run: `vercel`
3. Follow prompts. First deploy is preview; run `vercel --prod` to publish to production URL.

## Publish a new weekly issue

Two patterns to choose from:

**Pattern 1 — Overwrite each week (simple).** Replace `index.html` with the new issue, commit, push. Vercel redeploys automatically. Old issues are not preserved.

**Pattern 2 — Archive each issue (preferred for an ongoing newsletter).** Move the previous issue to `/archive/YYYY-MM-DD/index.html` before replacing the root `index.html`. Past issues stay live at clean URLs. Folder structure:

```
/index.html                        ← current issue
/archive/2026-05-25/index.html     ← prior issues
/archive/2026-06-01/index.html
```

Add an "Archive" link to the footer of each issue once you have 2+ issues.

## Custom domain setup

In Vercel: Project Settings → Domains → Add `digest.vinylmarketing.com` (or whatever subdomain you pick). Vercel shows the DNS CNAME record to add at your domain registrar. Propagation usually under 5 min.

## Brand notes

The newsletter uses the Vinyl Marketing design system — cream background, warm gradient blob, teal-deep text, peach accents, DM Sans + JetBrains Mono. Built with the `vinyl-page-builder` skill so any future issue can be regenerated on-brand.
