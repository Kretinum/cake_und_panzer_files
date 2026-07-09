# Disabled gun packs — backup (2026-07-09, before release v1.0.29)

Removed from all 3 packs: **Maxstuff**, **Endless Ammo**, **Cold War** + their custom
KubeJS ammo recipes (ea:* and maxstuff:* calibers; Cold War used standard calibers so
had no custom recipes). ARIPS (apdf:*), F4EJ (f4ej_kai:*), J10B (j10b:*) were KEPT.

## Nothing is lost
- Gun pack **ZIPs** remain in the `gunpacks` GitHub release (never deleted).
- Full pre-removal snapshot = git tag **v1.0.28**.

## What's here
- `tacz-metafiles/`         — the 3 gun pack .pw.toml (re-add to full/ basic/ server/ tacz/)
- `kubejs-scripts-full-ammo/` — original tacz_casings.js + tacz_create_ammo.js (with ea+maxstuff)
- `casing-models-ea-maxstuff/` — the 108 casing model JSONs for ea/maxstuff calibers

## To re-enable (restore everything from git)
    cd cake_und_panzer_files
    for p in full basic server; do
      git checkout v1.0.28 -- $p/tacz/maxstuff.pw.toml $p/tacz/endlessammo.pw.toml $p/tacz/coldwar.pw.toml
      git checkout v1.0.28 -- $p/kubejs/startup_scripts/tacz_casings.js $p/kubejs/server_scripts/tacz_create_ammo.js
      git checkout v1.0.28 -- $p/kubejs/assets/kubejs/models/item
    done
    ./publish.sh
