// Registers a new Unprepared + Prepared casing item per caliber (ea / apdf / maxstuff).
// Textures are supplied by kubejs/assets/kubejs/models/item/casing_*.json,
// which point at the closest tacz_c casing texture (_case / _case_full).
// Item registration is at STARTUP -> requires a game restart.

const AMMOS = [
    "f4ej_kai:m56a3", "f4ej_kai:mk32heat", "j10b:23_2",
    "create_armorer:slap", "create_armorer:gernade", "create_armorer:gas_pistol_ammo", "create_armorer:rbapb"
  ]

StartupEvents.registry("item", event => {
  function reg(id) {
    var key = id.replace(":", "_")
    var cal = id.split(":")[1].toUpperCase()
    event.create("casing_" + key).displayName("Unprepared " + cal + " Casing")
    event.create("casing_full_" + key).displayName(cal + " Casing")
  }
  AMMOS.forEach(reg)
})
