#!/bin/sh
# Pre-launch: mods come from packwiz (Modrinth/Releases, always reliable); the client
# "extras" (settings, panzer font, shaders, configs) come from ONE reliable Release zip
# instead of ~60 separate jsDelivr files (jsDelivr rate-limits fresh clients per-region,
# which left some friends with all mods but no shaders/font/options).
REPO="Kretinum/cake_und_panzer_files"
PACK="basic"
OVR="CAKE-Basic-overrides.zip"

JAVA="$INST_JAVA"
if [ -z "$JAVA" ]; then
  for c in "$HOME/Library/Application Support/PrismLauncher/java"/*/bin/java; do
    [ -x "$c" ] && JAVA="$c" && break
  done
fi
[ -z "$JAVA" ] && JAVA="$(command -v java 2>/dev/null)"

TAG=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" 2>/dev/null | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -1)
[ -z "$TAG" ] && TAG="v1.0.0"
echo "[packwiz-sync] pack $TAG"

# --- extras: one reliable download from the GitHub release (skipped if already current) ---
if [ "$(cat .overrides-version 2>/dev/null)" != "$TAG" ]; then
  echo "[packwiz-sync] fetching extras ($TAG)..."
  if curl -fsSL -o overrides.zip "https://github.com/$REPO/releases/download/$TAG/$OVR"; then
    if unzip -o -q overrides.zip; then
      echo "$TAG" > .overrides-version
      echo "[packwiz-sync] extras updated"
    fi
    rm -f overrides.zip
  else
    echo "[packwiz-sync] extras download skipped (packwiz will try instead)"
  fi
fi

# --- mods (extras already on disk -> packwiz verifies + skips them, no jsDelivr for those) ---
"$JAVA" -jar packwiz-installer-bootstrap.jar "https://cdn.jsdelivr.net/gh/$REPO@$TAG/$PACK/pack.toml" \
  || echo "[packwiz-sync] mod sync incomplete - launching with current mods"
exit 0
