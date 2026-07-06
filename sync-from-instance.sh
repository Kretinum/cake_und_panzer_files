#!/bin/sh
# sync-from-instance.sh — copy the loose "extras" you edited in your live Prism instance
# (options.txt, configs incl. the FancyMenu menu, kubejs, resource/shaderpacks) back into
# the repo, so ./publish.sh ships them. Mods are NOT touched (packwiz owns those).
#
# Usage:  ./sync-from-instance.sh          # Full pack  (default)
#         ./sync-from-instance.sh basic    # Basic pack
#
# Then review with `git diff`, and run ./publish.sh to release.
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
PACK="${1:-full}"
INST_ROOT="$HOME/Library/Application Support/PrismLauncher/instances"

case "$PACK" in
  full)  SRC="$INST_ROOT/c-AKE-und-PANZER-MacLinux(1)/minecraft"; ITEMS="options.txt servers.dat config kubejs resourcepacks shaderpacks" ;;
  basic) SRC="$INST_ROOT/c-AKE-und-PANZER-Basic-MacLinux/minecraft"; ITEMS="options.txt servers.dat config kubejs resourcepacks" ;;
  *) echo "usage: $0 [full|basic]"; exit 1 ;;
esac
DST="$REPO_DIR/$PACK"

[ -d "$SRC" ] || { echo "!! instance not found: $SRC"; exit 1; }
echo "==> syncing $PACK  from: $SRC"

# rsync each item; --delete keeps repo in sync with the instance (removed files go away too).
# Excludes = per-world/runtime junk that must never ship (also blocked by .packwizignore).
for item in $ITEMS; do
  [ -e "$SRC/$item" ] || { echo "    (skip $item — not in instance)"; continue; }
  if [ -d "$SRC/$item" ]; then
    rsync -a --delete \
      --exclude '.DS_Store' \
      --exclude 'jei/world/' \
      --exclude '*.log' \
      --exclude 'fancymenu/instance_data/' \
      "$SRC/$item/" "$DST/$item/"
  else
    cp "$SRC/$item" "$DST/$item"
  fi
  echo "    synced $item"
done

echo ""
echo "✅ pulled into $PACK/. Review:   git -C \"$REPO_DIR\" diff --stat"
echo "   then release:                 ./publish.sh"
