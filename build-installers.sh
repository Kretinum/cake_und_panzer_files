#!/bin/sh
# build-installers.sh — rebuild the 4 Prism import zips from installer/<variant>/ and
# upload them to the "installers" release. Run this ONLY when the pre-launch scripts change
# (rare) — routine pack updates just need ./publish.sh. Existing friends keep their current
# instance; the new scripts reach them whenever they next re-import.
set -e
export PATH="$PATH:/opt/homebrew/bin"
GH_REPO="Kretinum/cake_und_panzer_files"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR/installer"

# variant dir -> release asset name (the zip friends download + import)
build() {  # $1=dir  $2=asset
  z="$REPO_DIR/$2"
  rm -f "$z"
  ( cd "$1" && zip -r -q "$z" . -x '*.DS_Store' -x '*/.DS_Store' )
  gh release upload installers "$z" --repo "$GH_REPO" --clobber >/dev/null 2>&1
  echo "    uploaded $2 ($(du -h "$z" | cut -f1 | tr -d ' '))"
  rm -f "$z"
}

echo "==> Rebuilding import zips..."
build full-maclinux  "c-AKE-und-PANZER-MacLinux.zip"
build full-windows   "c-AKE-und-PANZER-Windows.zip"
build basic-maclinux "c-AKE-und-PANZER-Basic-MacLinux.zip"
build basic-windows  "c-AKE-und-PANZER-Basic-Windows.zip"
echo "✅ Installers rebuilt. Fresh imports use the new extras-zip flow."
