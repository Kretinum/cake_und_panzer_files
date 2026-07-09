// Create 6 (6.0.10) ammo chain — RAW JSON via event.custom(), bypassing kubejs-create's
// broken typed builders (build.18 emits old-format recipes Create 6 silently ignores).
// Formats verified against Create 6.0.10's own recipe schema:
//   results use {"id": ...}  (not {"item":{"id":...}}), sequenced_assembly uses transitional_item.
//
// Chain per caliber:
//   brass cylinder --saw/cutting--> 5x Unprepared casing  (automation)
//   Ammo Workbench (selectable) --> 5x Unprepared casing  (for hand-craft / saw-output filters)
//   Unprepared --sequenced_assembly[deploy primer, deploy gunpowder]--> Prepared (kubejs:casing_full_<key>)
//   Prepared + tacz_c:bullet --deploying--> tacz:ammo x8  (with custom_data AmmoId)
// Casing items are registered in startup_scripts/tacz_casings.js.

ServerEvents.recipes(event => {
  const AMMOS = [
    "f4ej_kai:m56a3", "f4ej_kai:mk32heat", "j10b:23_2",
    "create_armorer:slap", "create_armorer:40mmhe", "create_armorer:gernade", "create_armorer:gas_pistol_ammo", "create_armorer:rbapb"
  ]

  function build(id) {
    var key  = id.replace(":", "_")
    var cas  = "kubejs:casing_" + key        // unprepared
    var casf = "kubejs:casing_full_" + key   // prepared

    // 1a) cutting (mechanical saw): brass cylinder -> 5 unprepared casings. Keeps full automation.
    event.custom({
      type: "create:cutting",
      ingredients: [ { item: "tacz_c:annealed_brass_cylinder" } ],
      results: [ { id: cas, count: 5 } ]
    }).id("tacz_create_ammo:cut_" + key)

    // 1b) Ammo Workbench (tacz:gun_smith_table_crafting): craft the SPECIFIC unprepared casing by hand.
    //     Selectable in the table UI; use the crafted casing as a filter (funnels/belts) to sort saw output.
    //     Result type "item" is accepted by the table parser; group = an ammo-workbench tab.
    event.custom({
      type: "tacz:gun_smith_table_crafting",
      materials: [ { item: { item: "tacz_c:annealed_brass_cylinder" }, count: 1 } ],
      result: { type: "custom", group: "tacz:lc_specialized", item: { id: cas, count: 1 } }
    }).id("tacz_create_ammo:casing_" + key)

    // 2) sequenced assembly: unprepared -> deploy primer -> deploy gunpowder -> prepared
    event.custom({
      type: "create:sequenced_assembly",
      ingredient: { item: cas },
      transitional_item: { id: cas },
      loops: 1,
      results: [ { id: casf } ],
      sequence: [
        {
          type: "create:deploying",
          ingredients: [ { item: cas }, { item: "tacz_c:primer" } ],
          results: [ { id: cas } ]
        },
        {
          type: "create:deploying",
          ingredients: [ { item: cas }, { item: "tacz_c:gunpowder_grains" } ],
          results: [ { id: cas } ]
        }
      ]
    }).id("tacz_create_ammo:prep_" + key)

    // 3) deploying: prepared casing + bullet -> 8x ammo (carrying the TaCZ AmmoId)
    event.custom({
      type: "create:deploying",
      ingredients: [ { item: casf }, { item: "tacz_c:bullet" } ],
      results: [ { id: "tacz:ammo", count: (id == "f4ej_kai:mk32heat" ? 16 : 8), components: { "minecraft:custom_data": { AmmoId: id } } } ]
    }).id("tacz_create_ammo:" + key)
  }

  var made = 0
  AMMOS.forEach(id => {
    try { build(id); made++ }
    catch (e) { console.error("[tacz_create_ammo] failed for " + id + ": " + e) }
  })
  console.info("[tacz_create_ammo] added " + made + " Create-6 caliber chains (raw JSON)")

  // Bullet cores at the table too — small + large both saw-cut from tacz_c:metal_nuggets (they overlap
  // on the saw). Craft one at the table to use as the saw's output filter. Saw cutting recipes stay for bulk.
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [ { item: { tag: "tacz_c:metal_nuggets" }, count: 1 } ],
    result: { type: "custom", group: "tacz:lc_specialized", item: { id: "tacz_c:bullet_core", count: 1 } }
  }).id("tacz_create_ammo:core_small")
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [ { item: { tag: "tacz_c:metal_nuggets" }, count: 1 } ],
    result: { type: "custom", group: "tacz:lc_specialized", item: { id: "tacz_c:large_bullet_core", count: 1 } }
  }).id("tacz_create_ammo:core_large")

  // Bullet table makes ONLY casings: remove every native full-ammo recipe (ids are tacz:ammo/<caliber>).
  // Full ammo is craftable exclusively via the Create chain above. Casing recipes (tacz_create_ammo:casing_*)
  // and guns/attachments are untouched.
  event.remove({ id: /^tacz:ammo\/.*/ })
  // disable ALL vanilla TaCZ guns + attachments: strip their gunsmith recipes so they
  // are uncraftable / not shown in the table. Kept packs (f4ej_kai/j10b/j20s/create_armorer)
  // use their own namespaces, so they are untouched.
  event.remove({ id: /^tacz:gun\/.*/ })
  event.remove({ id: /^tacz:attachments\/.*/ })
  // Create Armorer ammo now uses OUR unprepared->prepared casing chain above (bootstrappable at the
  // gunsmith table, returns 1). Remove Immersive-TaCZ brass-sheet casing + fill recipes for them so
  // ours is the only path. tacz:12g stays on Immersive-TaCZ.
  event.remove({ id: /^createimmersivetacz:ammo\/(slap|40mmhe|grenade|pneumatic_pistol|rimmed_blunt_ap)_casing.*/ })
  // gun-pack ammo moved to the Create chain -> remove their bullet-table recipes
  event.remove({ id: "f4ej_kai:ammo/m56a3" })
  event.remove({ id: "f4ej_kai:ammo/mk32" })
  event.remove({ id: "j10b:ammo/23_2" })
})
