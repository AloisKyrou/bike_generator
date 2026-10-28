# External converter controller

28 October checkpoint: user has approved INA237AIDGSR for both sensors and
Harwin 1.05 mm / JST J26 0.80 mm drill variants. These changes and the USB
repair are NOT applied: Konnect IPC remains unavailable. Current schematic,
PCB and BOM still describe INA238. Apply and verify together before ordering;
do not confuse a selection approval with an updated CAD/BOM release.

24 October restart: [current review and final phases](FINAL_PHASES_2026-10-24.md).
Fresh ERC0, DRC0errors/4knownsilk/0unconnected,17fixturesPASS; saved design
unchanged. Local USB repair, connector-fit decision and current INA sourcing
remain before a new reviewed order package. Historical checkpoints below are
not new releases; the old manufacturing ZIP must not be ordered.

Latest full review: [schematic and routing audit](FULL_PREFAB_REVIEW_2026-10-15.md).
Current user routing is preserved: 588 tracks /107 vias. USB return/pair routing
and finished-hole fit need closure before order. Previous prefab ZIP is obsolete;
regenerate after corrections. Review outputs are in `kicad/exports/full-review-2026-10-15/`.

## Current checkpoint, 15 October 2026

Latest: [prototype preparation](PREFAB_CLOSEOUT_2026-10-15.md). C42 is now after
R45, next to TP4057.VCC; no added parts. ERC0, DRC0errors/4knownedge warnings,
0unconnected,17negativefixtures pass.591tracks107vias84footprints. User chose
5 JLCPCB boards / components for2, self-assembly. Gerbers and two-supplier
shopping drafts prepared; final sync is NOOP. References/board labels are now
1mm/0.15mm; final exports are in `kicad/exports/prefab-2026-10-15-final/`.
Order approval/preview and physical connector fit remain separate.
The older checkpoint below is superseded where it differs.

Latest: [2 oz, return-path and BOM review](REVIEW_2OZ_2026-10-15.md).
J27/J26 now use approved local enlarged PTH pads, without changed holes or
routing. Native stackup is two layers / 70 um each / 1.6 mm total. The inspected
JLC 2 oz geometries pass; manufacturer and operating qualification remain open.
36 missing MPNs are completed; five 10 uF capacitors still need bias qualification.

Separate KiCad variant inspired by V1 and V2, with an external CC/CV converter.
The latest user decision favors the prototype's direct dual digipot interface
over a costly/power-consuming automatic mechanical fallback. The three relays,
their driver/passives and two manual-pot headers have been removed. No hidden
electronic selector or new auxiliary supply replaces them.

- ESP32-C3 module, native USB, generic GPIO and USB/optional protected 1S power.
- Two INA238 monitors with separate input/output Kelvin shunts and terminals.
- MCP42100-I/SL, two 100 kOhm channels exposed as independent CC and CV A/W/B.
- No LM5164 auxiliary generator supply and no integrated BQ25756 converter.
- GPIO20 is spare and explicitly NC; no automatic manual mode is promised.

Project:
[`bike-generator-external-controller.kicad_pro`](kicad/bike-generator-external-controller/bike-generator-external-controller.kicad_pro).
Read [control and sensing](CONTROL_AND_SENSING.md) before connecting a converter.
The active `CC_CV_DIGIPOT` block retains the historical child filename
`cc_selector_3wire.kicad_sch`; it now contains only the direct digipot circuit.

The saved schematic contains 81 components and 84 nets across nine sheets.
Hierarchy ERC: zero errors/warnings. The independent Direct contract passes,
including 11 deliberately broken connections and one A/W-short fixture.
See [schematic checkpoint](DIRECT_DIGIPOT_CHECKPOINT_2026-10-14.md).
The [working BOM](bom/controller-external-working.csv) lists the active 81 parts;
it is not a purchase/assembly release. Three board-only mounting holes are not
counted as schematic components.

PCB migration and routing are complete; it is no longer the untouched V1 copy.
The [minimal-reroute plan](PCB_REUSE_PLAN_2026-10-14.md) explains preservation
priorities, but its original counts and proposed geometry are historical.
Use the [latest PCB handoff](REVIEW_2OZ_2026-10-15.md) for actual routed
state:84 footprints,585 tracks,106 vias,zero unconnected items. J27 is now HRO
TYPE-C-31-M-12 with the local 2 oz footprint. ERC0; DRC0 errors and4 silk-edge
warnings. Sync noop; parity only H1/H2/H4. The former JAE errors are removed,
but the manufacturer/2oz contract is still open. Electrical ratings still
require qualification; complete connectivity is not proof of safe operation.

Review exports: [top](kicad/exports/review-2oz-2026-10-15/top-review.pdf),
[bottom](kicad/exports/review-2oz-2026-10-15/bottom-review.pdf),
[schematic](kicad/exports/review-2oz-2026-10-15/schematic-review.pdf).
These are local review PDFs, not manufacturing files.

## Operating boundary

Power logic and initialize both codes BEFORE enabling the external converter.
Stop the converter before removing logic power. U3 starts at midscale 0x80;
that is not inherently a safe voltage or current. With valid supply and idle
SPI it retains its last code, but no valid safe setpoint is guaranteed unpowered.
All A/W/B terminals must remain within GND..VDD and the project +/-1 mA limit.
External converter hardware must independently protect the receiver.

This is not an isolated interface, universal battery charger or power-off
mechanical fallback. Measure unknown converter terminals before connection;
prevent back-power through U3 and do not use a computer/energy-rich battery
for initial interface qualification. USB current, cell charge/dropout, cooling,
fusing and the manufacturer/copper-weight contract remain open gates.
User accepts10A as the continuous design target on each power path, not a
qualified rating, and confirmed a two-layer/2oz copper design basis on14October2026.
See [current screen](CURRENT_AND_FABRICATION_2026-10-14.md).

## Architecture

```text
Generator -> rectifier/protection -> input shunt -> external converter IN
external converter OUT+ -> output shunt -> receiver +
USB / optional protected 1S -> logic supply -> ESP32 + MCP42100 + INA238 x2
```

Use J1 DC OR J8 three-phase, never both energized together. Input and output
positive rails stay separate; all grounds are common. The output voltage is
sensed at the receiver-side board terminal, not remotely after cable losses.
Electrical input power is useful for pedal-load control but is not mechanical
rider power. A digipot code is a command, not measured voltage or current.

Each revision is its own KiCad project. V1 and integrated V2 remain intact.
Shared blocks require interface review; do not copy their ratings blindly.
No firmware work, fabrication release or component order is authorized here.

## History and sourcing

- [Original V1 source hash manifest](v1-source-sha256.csv): eleven native source
  files were copied before Konnect renamed the project; local libraries/models
  were copied and checked separately.
- [Earlier three-relay checkpoint](THREE_WIRE_CHECKPOINT_2026-10-14.md): retained
  as historical evidence, superseded by the direct interface.
- [Sourcing check](SOURCING_CHECK.md): recorded leads, not guaranteed live stock.
  INA238 stock/cost and a complete component basket require rechecking before
  purchase. [BOM budget](bom/README.md):43.47-77.89EUR planning range, not a cart.
- [V1 review](../v1/docs/V1_SCHEMATIC_REVIEW.md) and
  [external module notes](../components/buck-b0blg7tn1c/README.md) preserve the
  original prototype assumptions; actual CC/CV electrical qualification remains
  necessary even though that breadboard prototype worked.
