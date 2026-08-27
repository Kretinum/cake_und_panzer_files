// Steel unification: make any recipe that wants TFMG steel accept ANY steel ingot.
//
// The pack has three interchangeable "plain steel" ingots that all live in the
// c:ingots/steel tag (each mod adds its own; they merge at runtime):
//   - tfmg:steel_ingot
//   - createbigcannons:steel_ingot
//   - createnuclear:steel_ingot
//
// TFMG's tag-based recipes (stonecutting: bars, rebar, screw, ladder, scaffolding,
// industrial pipe) already accept the tag. But TFMG's code-registered recipes --
// the steel cogwheels and friends -- hardcode tfmg:steel_ingot, so they only take
// TFMG's own steel. Swapping that hardcoded item for the tag fixes every one of them
// at once. Because the tag INCLUDES tfmg:steel_ingot, this never removes an existing
// option -- it only widens what's accepted.
ServerEvents.recipes(event => {
  event.replaceInput({}, 'tfmg:steel_ingot', '#c:ingots/steel')
})
