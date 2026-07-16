#!/usr/bin/env bash
# Scaffold a new Creative edition from the template.
# Usage:  ./scripts/new-creative.sh 2026-07-13
set -euo pipefail

DATE="${1:-}"
if [[ ! "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Usage: ./scripts/new-creative.sh YYYY-MM-DD"
  echo "Example: ./scripts/new-creative.sh 2026-07-13"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/creative/$DATE"

if [[ -e "$DEST" ]]; then
  echo "✗ creative/$DATE already exists — nothing changed."
  exit 1
fi

mkdir -p "$DEST"
cp "$ROOT/templates/creative.html" "$DEST/index.html"

echo "✓ Created creative/$DATE/index.html from the template."
echo
echo "Next:"
echo "  1. Fill in creative/$DATE/index.html — replace every {{PLACEHOLDER}}, and"
echo "     duplicate the <div class=\"cpick\"> block once per pick. For a real image,"
echo "     drop the file in creative/$DATE/ and swap the placeholder <svg> for <img src=\"…\">."
echo "  2. Add this entry to the TOP of the EDITIONS array in creative/index.html:"
echo
cat <<EOF
  {
    num: "NN",
    date: "Week of $(date -j -f %Y-%m-%d "$DATE" "+%b %-d, %Y" 2>/dev/null || echo "$DATE")",
    href: "/creative/$DATE",
    title: "Edition headline",
    dek: "A short line on this week's creative.",
    picks: 4
  },
EOF
echo
echo "  3. git add -A && git commit -m \"Add creative edition: $DATE\" && git push"
echo "     Vercel redeploys automatically."
