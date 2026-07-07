#!/bin/sh
# publish.sh — cut a new release of the pack so friends (and the server) get it.
#
# Usage:
#   ./publish.sh            -> auto-bumps the patch version (v1.0.0 -> v1.0.1)
#   ./publish.sh v1.2.0     -> uses the version you give
#
# What it does: refresh packs -> commit+push -> tag + GitHub release ->
# warm the jsDelivr cache for the new tag -> verify a clean install works.
set -e
export PATH="$PATH:$HOME/go/bin:/opt/homebrew/bin"

GH_REPO="Kretinum/cake_und_panzer_files"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

# ---- 1. figure out the new version ----
if [ -n "$1" ]; then
  NEW="$1"
else
  LAST="$(git tag -l 'v*' | sort -V | tail -1)"; LAST="${LAST:-v0.0.0}"
  MAJ="$(echo "$LAST" | sed 's/^v//' | cut -d. -f1)"
  MIN="$(echo "$LAST" | cut -d. -f2)"
  PAT="$(echo "$LAST" | cut -d. -f3)"
  NEW="v$MAJ.$MIN.$((PAT + 1))"
fi
echo "==> Publishing $NEW"

# ---- 2. refresh every pack's index ----
for p in full basic server; do
  ( cd "$p" && packwiz refresh >/dev/null ) && echo "    refreshed $p"
done

# ---- 3. commit + push content ----
git add -A
git commit -q -m "Release $NEW" || echo "    (no content changes to commit)"
git push -q origin main
echo "    pushed to main"

# ---- 4. tag + GitHub release ----
git tag -f "$NEW"
git push -f origin "$NEW" >/dev/null 2>&1
gh release create "$NEW" --repo "$GH_REPO" --title "Pack $NEW" --notes "Release $NEW" >/dev/null 2>&1 \
  || echo "    (release $NEW already exists, reusing tag)"
echo "    tagged + released $NEW"

# ---- 4b. build + attach the client "extras" zip per pack ----
# Loose overrides (settings, font, shaders, configs — incl. special-char names jsDelivr chokes on)
# ship as ONE reliable Release download instead of ~60 jsDelivr files. The pre-launch script grabs
# this and extracts it; packwiz then verifies-and-skips the same files (they stay in the index).
# Files written by in-game settings screens — user territory. We do NOT ship these in the
# overwrite zip, so a friend's video/shader/DH/camera tweaks survive updates. packwiz still
# delivers them ONCE on a fresh install and (verified) preserves user edits on later syncs.
PREF_FILES="options.txt config/sodium-options.json config/iris.properties config/DistantHorizons.toml config/shouldersurfing-client.toml config/yes_steve_model-client.toml"

echo "==> Building extras (overrides) zips..."
for p in full basic server; do
  case "$p" in
    full)   name="CAKE-Full-overrides.zip" ;;
    basic)  name="CAKE-Basic-overrides.zip" ;;
    server) name="CAKE-Server-overrides.zip" ;;
  esac
  z="$REPO_DIR/$name"
  rm -f "$z"
  ( cd "$p" && zip -r -q "$z" . \
      -x 'pack.toml' -x 'index.toml' -x '.packwizignore' \
      -x '*.pw.toml' -x '*.DS_Store' -x '*/.DS_Store' -x 'mods/*' )
  # client packs: strip the user-settings files out of the overwrite zip (server keeps all its configs)
  if [ "$p" != "server" ]; then
    zip -d -q "$z" $PREF_FILES >/dev/null 2>&1 || true
  fi
  gh release upload "$NEW" "$z" --repo "$GH_REPO" --clobber >/dev/null 2>&1
  echo "    attached $name ($(du -h "$z" | cut -f1 | tr -d ' '))"
  rm -f "$z"
done

# ---- 5. warm the jsDelivr cache for this tag (so first friend install has no cold-cache 404) ----
echo "==> Warming CDN cache (a minute)..."
warm_list="$(mktemp)"
for p in full basic server; do
  echo "$p/pack.toml"
  grep '^file = ' "$p/index.toml" | sed 's/^file = "//; s/"$//' | sed "s|^|$p/|"
done | sort -u > "$warm_list"
# fetch each URL-encoded path in parallel just to populate jsDelivr's cache
python3 - "$GH_REPO" "$NEW" "$warm_list" <<'PY'
import sys, urllib.parse, urllib.request, concurrent.futures
repo, tag, listfile = sys.argv[1], sys.argv[2], sys.argv[3]
paths = [l.strip() for l in open(listfile) if l.strip()]
def hit(path):
    enc = urllib.parse.quote(path)
    url = f"https://cdn.jsdelivr.net/gh/{repo}@{tag}/{enc}"
    try:
        urllib.request.urlopen(url, timeout=30).read(1)
        return True
    except Exception:
        return False
ok = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
    for r in ex.map(hit, paths):
        ok += 1 if r else 0
print(f"    warmed {ok}/{len(paths)} files")
PY
rm -f "$warm_list"

# ---- 6. verify a clean install (retry: each pass warms any stragglers) ----
echo "==> Verifying a clean install..."
T="$(mktemp -d)"; cd "$T"
curl -sL -o b.jar https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar
JAVA="$(ls "$HOME/Library/Application Support/PrismLauncher/java"/*/bin/java 2>/dev/null | head -1)"
[ -z "$JAVA" ] && JAVA="java"
ok=0
for attempt in 1 2 3 4; do
  if "$JAVA" -jar b.jar -g "https://cdn.jsdelivr.net/gh/$GH_REPO@$NEW/full/pack.toml" 2>&1 | grep -q "Finished successfully"; then
    ok=1; break
  fi
  echo "    attempt $attempt warmed more; retrying..."
done
cd / && rm -rf "$T"

if [ "$ok" = 1 ]; then
  echo ""
  echo "✅ $NEW is live and verified. Friends get it automatically on next launch."
else
  echo ""
  echo "⚠️  Verify didn't finish cleanly. Wait ~1 min and run:  ./publish.sh $NEW  (re-runs safely)"
fi
