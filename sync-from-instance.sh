#!/bin/sh
# sync-from-instance.sh — copy the loose "extras" you edited in a live Prism instance
# (options.txt, configs incl. the FancyMenu menu, kubejs, resource/shaderpacks) back into
# the repo, so ./publish.sh ships them. Mods are NOT touched (packwiz owns those).
#
# Usage:  ./sync-from-instance.sh <full|basic> "<instance-folder-name>"
#   e.g.  ./sync-from-instance.sh full "c-AKE-und-PANZER-MacLinux(2)"
#
# Run with no args to list the instances you can sync from.
# Then review with `git diff`, and run ./publish.sh to release.
set -e
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
INST_ROOT="$HOME/Library/Application Support/PrismLauncher/instances"

PACK="$1"
INST="$2"

if [ -z "$PACK" ] || [ -z "$INST" ]; then
  echo "usage: ./sync-from-instance.sh <full|basic> \"<instance-folder-name>\""
  echo ""
  echo "instances you can sync from:"
  ls -1 "$INST_ROOT" 2>/dev/null | grep -i panzer | sed 's/^/   /'
  exit 1
fi

case "$PACK" in
  full)  ITEMS="options.txt servers.dat config kubejs resourcepacks shaderpacks" ;;
  basic) ITEMS="options.txt servers.dat config kubejs resourcepacks" ;;
  *) echo "!! first arg must be 'full' or 'basic'"; exit 1 ;;
esac

SRC="$INST_ROOT/$INST/minecraft"
DST="$REPO_DIR/$PACK"
[ -d "$SRC" ] || { echo "!! instance not found: $SRC"; exit 1; }
echo "==> syncing into $PACK/   from: $INST"

# rsync each item; --delete keeps the repo mirror-equal to the instance.
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
