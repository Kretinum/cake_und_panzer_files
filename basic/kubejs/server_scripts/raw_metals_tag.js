// Custom `kubejs:raw_metals` tag — an exact "all raw metals" tag for filters/automation.
//
// Why this exists: the convention tag `c:raw_materials` is BOTH polluted and incomplete here:
//   - POLLUTED: it pulls in createpropulsion:pine_resin (not a metal) via #c:raw_materials/resin,
//     so a raw-materials filter would feed resin into a crusher/smelter line.
//   - INCOMPLETE: it MISSES iceandfire:raw_silver. Ice & Fire only registers silver into the
//     #c:raw_materials/silver subtag, and nothing ever adds that subtag to the umbrella tag.
// Create's Attribute Filter only offers Allow-List(All) / Allow-List(Any) / Deny-List, so it
// cannot express "(in raw_materials OR is silver) AND NOT resin". Hence an exact tag instead.
//
// We deliberately do NOT edit c:raw_materials itself — removing pine_resin from it could break
// Create Propulsion recipes that legitimately use that tag as an ingredient.
//
// Usage: Attribute Filter -> put any raw metal in the reference slot -> select
//        "is tagged kubejs:raw_metals" -> Add attribute to List.
//
// NOTE: raw_lead exists TWICE as separate items (Create Nuclear + TFMG). Both are listed;
//       omitting either would make that variety silently never sort.

ServerEvents.tags("item", event => {
  event.add("kubejs:raw_metals", [
    "minecraft:raw_iron",
    "minecraft:raw_gold",
    "minecraft:raw_copper",
    "create:raw_zinc",
    "createnuclear:raw_lead",
    "createnuclear:raw_uranium",
    "createpropulsion:raw_platinum",
    "iceandfire:raw_silver",
    "tfmg:raw_lead",
    "tfmg:raw_lithium",
    "tfmg:raw_nickel",
    "undergarden:raw_cloggrum",
    "undergarden:raw_froststeel"
  ])
})
