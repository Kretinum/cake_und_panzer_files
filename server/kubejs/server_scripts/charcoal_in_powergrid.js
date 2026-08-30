// Let Create: Power Grid accept BLOCKS of charcoal (betterend:charcoal_block) anywhere it
// wants a block of coal. Power Grid uses coal blocks in exactly two spots:
//   1. the `power_resistor` crafting recipe (ingredient minecraft:coal_block)
//   2. the Carbon Pile multiblock, validated against the block tag powergrid:carbon_pile_block
//      (which ships as just [minecraft:coal_block])
// Its OTHER coal recipes (light bulb, resistor, rheostat, variac, varistor, potentiometer,
// generator commutator) use the minecraft:coals ITEM tag, which already contains charcoal,
// so those already work and are left alone.

// 1. Carbon Pile multiblock: allow charcoal blocks as part of the structure.
ServerEvents.tags("block", event => {
  event.add("powergrid:carbon_pile_block", "betterend:charcoal_block")
})

// 2. Widen coal_block -> (coal_block OR charcoal_block) in Power Grid crafting recipes only.
//    Scoped to mod:powergrid so no other mod's coal_block recipes are touched.
ServerEvents.recipes(event => {
  event.replaceInput(
    { mod: "powergrid" },
    "minecraft:coal_block",
    ["minecraft:coal_block", "betterend:charcoal_block"]
  )
})
