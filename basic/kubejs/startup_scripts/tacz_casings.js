// Registers a new Unprepared + Prepared casing item per caliber (ea / apdf / maxstuff).
// Textures are supplied by kubejs/assets/kubejs/models/item/casing_*.json,
// which point at the closest tacz_c casing texture (_case / _case_full).
// Item registration is at STARTUP -> requires a game restart.

const AMMOS = [
  "ea:10g", "ea:10mm", "ea:127x108", "ea:127x55", "ea:145x114", "ea:17hmr", "ea:20g", "ea:20x102",
  "ea:22hornet", "ea:22lr", "ea:27kolibri", "ea:300blk", "ea:300winmag", "ea:3030win", "ea:30mauser",
  "ea:32acp", "ea:338arc", "ea:338norma", "ea:357sig", "ea:366magnum", "ea:366tkm", "ea:380auto",
  "ea:408cheytac", "ea:40sw", "ea:410bore", "ea:416barrett", "ea:44magnum", "ea:44special", "ea:454casull",
  "ea:458hamr", "ea:458socom", "ea:458winmag", "ea:4g", "ea:50beowulf", "ea:50gi", "ea:556x30", "ea:58x21",
  "ea:602x41", "ea:65creedmoor", "ea:68tvcm", "ea:6arc", "ea:75fk", "ea:792x33", "ea:86blk", "ea:950jdj",
  "ea:9x18", "ea:9x21", "ea:9x39",
  "apdf:0950x38", "apdf:1163x39",
  "maxstuff:12g_fl", "maxstuff:can_blanks", "maxstuff:laser", "maxstuff:nails", "maxstuff:bannana", "maxstuff:12g_db", "f4ej_kai:m56a3", "f4ej_kai:mk32heat", "j10b:23_2"
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
