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
    "ea:10g", "ea:10mm", "ea:127x108", "ea:127x55", "ea:145x114", "ea:17hmr", "ea:20g", "ea:20x102",
    "ea:22hornet", "ea:22lr", "ea:27kolibri", "ea:300blk", "ea:300winmag", "ea:3030win", "ea:30mauser",
    "ea:32acp", "ea:338arc", "ea:338norma", "ea:357sig", "ea:366magnum", "ea:366tkm", "ea:380auto",
    "ea:408cheytac", "ea:40sw", "ea:410bore", "ea:416barrett", "ea:44magnum", "ea:44special", "ea:454casull",
    "ea:458hamr", "ea:458socom", "ea:458winmag", "ea:4g", "ea:50beowulf", "ea:50gi", "ea:556x30", "ea:58x21",
    "ea:602x41", "ea:65creedmoor", "ea:68tvcm", "ea:6arc", "ea:75fk", "ea:792x33", "ea:86blk", "ea:950jdj",
    "ea:9x18", "ea:9x21", "ea:9x39",
    "apdf:0950x38", "apdf:1163x39",
    "maxstuff:12g_fl", "maxstuff:can_blanks", "maxstuff:laser", "maxstuff:nails", "maxstuff:bannana", "maxstuff:12g_db"
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
      result: { type: "custom", group: "tacz:lc_specialized", item: { id: cas, count: 5 } }
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
      results: [ { id: "tacz:ammo", count: 8, components: { "minecraft:custom_data": { AmmoId: id } } } ]
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
    result: { type: "custom", group: "tacz:lc_specialized", item: { id: "tacz_c:bullet_core", count: 20 } }
  }).id("tacz_create_ammo:core_small")
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [ { item: { tag: "tacz_c:metal_nuggets" }, count: 1 } ],
    result: { type: "custom", group: "tacz:lc_specialized", item: { id: "tacz_c:large_bullet_core", count: 10 } }
  }).id("tacz_create_ammo:core_large")

  // Bullet table makes ONLY casings: remove every native full-ammo recipe (ids are tacz:ammo/<caliber>).
  // Full ammo is craftable exclusively via the Create chain above. Casing recipes (tacz_create_ammo:casing_*)
  // and guns/attachments are untouched.
  event.remove({ id: /^tacz:ammo\/.*/ })
})
