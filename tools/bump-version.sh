#!/bin/sh
# Cache-busting for GitHub Pages (it serves everything with max-age=600, and
# browsers happily keep an old events.js next to a new index.html).
# Rewrites the ?v=... token on every local <script src> / stylesheet link in
# the HTML pages. Run from the repo root before committing changes to any
# .js/.css file:   sh tools/bump-version.sh
V=$(date -u +%Y%m%d%H%M%S)
for f in *.html; do
  sed -E -i '' \
    -e "s#(src=\"(events|app|post|timetable|eventposter)\.js)(\?v=[0-9A-Za-z]*)?\"#\1?v=$V\"#g" \
    -e "s#(src=\"vendor/qrcode\.min\.js)(\?v=[0-9A-Za-z]*)?\"#\1?v=$V\"#g" \
    -e "s#(href=\"style\.css)(\?v=[0-9A-Za-z]*)?\"#\1?v=$V\"#g" \
    "$f"
done
echo "version token: $V"
