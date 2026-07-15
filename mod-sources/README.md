# Custom client hotfix mods

Two tiny **client-only** NeoForge mixin mods written for this pack. Both are
hosted as jars on the `loose-jars` GitHub release and wired into the packs via
`mods/<name>.pw.toml`.

| Mod | Fixes | Ships to |
|-----|-------|----------|
| `ysmtaczfix` | YSM drawing a duplicate/unlit gun in first person while holding a TaCZ gun. Mixin cancels `EntityRenderDispatcher.render` for the local player, in first person, while a `tacz`-namespace item is held. | Full + Basic |
| `noenchantglint` | Enchanted-item FPS lag caused by Iris making the enchant-glint render pass expensive on 1.21.1 (Iris #2054). Mixin forces `ItemStack.hasFoil()` to `false`, so no glint layer is submitted. Cosmetic only (no sparkle). | Full only (Basic has no Iris) |

Both target vanilla Mojmap classes, so **no refmap is needed** (NeoForge 1.21.1
runs on Mojang mappings). They are in the mixin config's `client` list, so they
are inert on a dedicated server — but they are NOT in the `server` pack anyway.

## Rebuild (Windows, no Gradle)

Compiled by hand against the jars already in the PrismLauncher `libraries` cache.
From `mod-sources/<name>/`:

```sh
JAVAC="/c/Program Files/Eclipse Adoptium/jdk-21.0.11.10-hotspot/bin/javac"
JARBIN="/c/Program Files/Eclipse Adoptium/jdk-21.0.11.10-hotspot/bin/jar"
PL="/c/Users/mihai/AppData/Roaming/PrismLauncher/libraries"
CP="$(cygpath -w "$PL/net/neoforged/neoforge/21.1.234/neoforge-21.1.234-client.jar");$(cygpath -w "$PL/net/neoforged/neoforge/21.1.234/neoforge-21.1.234-universal.jar");$(cygpath -w "$PL/net/fabricmc/sponge-mixin/0.15.2+mixin.0.8.7/sponge-mixin-0.15.2+mixin.0.8.7.jar");$(cygpath -w "$PL/net/neoforged/fancymodloader/loader/4.0.42/loader-4.0.42.jar");$(cygpath -w "$PL/net/minecraft/client/1.21.1-20240808.144430/client-1.21.1-20240808.144430-srg.jar");$(cygpath -w "$PL/com/mojang/datafixerupper/8.0.16/datafixerupper-8.0.16.jar")"

rm -rf out && mkdir out
"$JAVAC" -proc:none -source 21 -target 21 -cp "$CP" -d "$(cygpath -w out)" $(find src -name '*.java' -exec cygpath -w {} \;)
cp resources/*.mixins.json out/
mkdir -p out/META-INF && cp resources/META-INF/neoforge.mods.toml out/META-INF/
( cd out && "$JARBIN" --create --file "$(cygpath -w ../<name>-1.0.0.jar)" . )
```

To update a jar: bump the version, rebuild, `gh release upload loose-jars <jar>`
(new filename — do NOT clobber), update the hash + filename in the `.pw.toml`,
`packwiz refresh`, then `./publish.sh`.
