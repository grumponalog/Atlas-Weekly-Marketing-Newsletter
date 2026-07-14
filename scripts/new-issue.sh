#!/usr/bin/env bash
# Scaffold a new weekly issue from the template.
# Usage:  ./scripts/new-issue.sh 2026-07-13
set -euo pipefail

DATE="${1:-}"
if [[ ! "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Usage: ./scripts/new-issue.sh YYYY-MM-DD"
  echo "Example: ./scripts/new-issue.sh 2026-07-13"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/issues/$DATE"

if [[ -e "$DEST" ]]; then
  echo "✗ issues/$DATE already exists — nothing changed."
  exit 1
fi

mkdir -p "$DEST"
cp "$ROOT/templates/issue.html" "$DEST/index.html"

echo "✓ Created issues/$DATE/index.html from the template."
echo
echo "Next:"
echo "  1. Fill in issues/$DATE/index.html — replace every {{PLACEHOLDER}},"
echo "     repeat the <section class=\"item\"> block per item, and update the .toc nav."
echo "     (Tip: run the josh-editorial-style skill on this week's digest to generate it.)"
echo "  2. Add this entry to the TOP of the ISSUES array in index.html:"
echo
cat <<EOF
  {
    num: "NN",
    date: "Week of $(date -j -f %Y-%m-%d "$DATE" "+%b %-d, %Y" 2>/dev/null || echo "$DATE")",
    href: "/issues/$DATE",
    title: "One-line headline for the week",
    dek: "A short standfirst summarizing the week.",
    items: ["Item 1 headline", "Item 2 headline"]
  },
EOF
echo
echo "  3. git add -A && git commit -m \"Add issue: $DATE\" && git push"
echo "     Vercel redeploys automatically."
