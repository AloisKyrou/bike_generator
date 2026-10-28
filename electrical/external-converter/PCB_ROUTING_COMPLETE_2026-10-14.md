# External controller: routing completion

14 October 2026. Routing-complete engineering checkpoint, NOT fabrication or
power-up approval. Supersedes the incomplete counts in PCB_DIRECT_PASS.

## Saved design

| Item | Verified result |
|---|---|
| Active schematic | 81 components, 84 nets, nine sheets |
| PCB | 85 footprints, including four board-only mounting holes |
| Copper | Two layers; 575 track segments, 447 F.Cu / 128 B.Cu |
| Vias | 104, independently counted from native GenCAD export |
| Unconnected items | 0 |
| Provisional outline | 80 x 115 mm bounding box, stepped upper edge |
| ERC | 0 findings |
| Direct netlist contract | Pass, including 11 broken connections and one A/W short negative fixture |
| Schematic-to-PCB sync | No changes/conflicts; four expected board-only holes |
| Final DRC | Five JAE copper-edge errors, two U2 silk-edge warnings |

No short, track/pad clearance, courtyard, library mismatch or dangling-route
finding remains. Existing ignored tests were retained, not expanded. DRC does
not verify current rating, RF performance, component models or fault safety.
The full V1 source hash manifest still matches. V2 and firmware were not edited
by this routing pass. No commit, order or manufacturing submission was made.

## Completed work

- Completed USB power/data/CC/ESD, charger, cell/LDO, reset/boot, GPIO, status
  indicators, I2C and remaining analog/sense connections.
- Preserved the input-power/sense placement anchors and reusable V1 copper;
  removed obsolete/dangling fragments rather than rerouting the entire board.
- Retained the two INA238 paths and six independent direct digipot terminals.
  No relays, manual selection, BQ converter or generator-powered AUX returned.
- Moved the USB data test header close to the series resistors to shorten its
  branches. Improved main D+/D- routing; this is not a 90-ohm qualification.
- Extended the outline locally to support the cell connector and cut a notch
  below the ESP antenna. The remaining antenna-edge silk warnings are visible,
  not suppressed. Enclosure/RF clearance still needs review and testing.
- Cleaned silkscreen references and added generator/converter/receiver, CC/CV,
  battery/output polarity and reset/boot header labels.
- Filled the ground plane natively, saved, checked connectivity and reviewed
  both copper faces. Final text-only edits did not change copper or zones.

## Where bottom routing is used

Top routing remains the majority. B.Cu transitions serve local Kelvin/filter
crossings, cell-power selection crossings, SPI escapes, I2C/GPIO distribution
and USB passage through the crowded logic area. Ground vias connect local
returns to the bottom plane. Small signal vias are not assigned the main load
current. The lower ground return is broad on the rendered fill, but terminal
thermal spokes and any local constrictions still need current qualification.

USB full-speed routes include layer changes and short test branches. The
independent review estimated bottom D+ about 18.61 mm, D- about 16.29 mm and
main-path mismatch about 3.3 mm. Continuous reference, impedance and actual
flash/debug/data operation must be validated; zero DRC is insufficient.

## Remaining release gates

1. **J27 fabrication, blocking.** Five errors belong to the JAE footprint's
   own locator slot and adjacent pads. Moving the connector cannot fix them.
   A compatible process must meet the actual dimensions/tolerances, not only
   nominal slot width. No rule waiver or custom footprint was introduced.
   See the [independent review](INDEPENDENT_REVIEW_2026-10-14.md).
2. **Manufacturing contract.** Select the fabricator, copper weight/stackup,
   clearances and cost; recheck the entire board against that process. Old V1
   settings and trace widths do not independently establish a current rating.
3. **Mechanical/thermal.** D2 remains on its inherited top side. Final bridge
   heatsink fastening, component clearance and enclosure are not frozen. Check
   connector mating, drill fit, standoffs and antenna clearance before ordering.
   Current/temperature tests determine the continuous rating; no 400 W claim.
4. **External converter and receiver.** Qualify CC/CV terminal voltages and
   currents with limited bench energy. Power/init logic before converter enable,
   stop converter before logic loss. No unpowered mechanical fallback exists.
   Converter hardware must independently bound receiver voltage/current.
5. **Battery-side protection.** F1 is on the input; it cannot interrupt a fault
   supplied through J41 by a receiver battery. Appropriate protection near that
   battery is required. Rating/breaking capacity depends on the actual source.
6. **USB/1S and RF tests.** Keep JP20 open for initial USB tests. Qualify source
   current, charging/cell compatibility, RT9080 dropout/heating, hot-plug and
   back-power behavior before using a PC with energized power circuitry. USB
   shares power GND; there is no galvanic isolation. Verify flash/debug/data,
   both INA readings, digipot codes and BLE with the intended enclosure.

These gates are not resolved by software checks. No energized battery or
computer is approved for initial fault/interface experiments.

## Reproducible evidence

Local scratch reports retained, not manufacturing outputs:

- `ext-routing-final-drc.json`: final saved board after connector-label cleanup.
- `ext-routing-complete-erc.json`, `ext-routing-complete.xml`: hierarchy ERC
  and netlist used by `verify-netlist.ps1 -InterfaceMode Direct -SelfTest`.
- `ext-sync-direct-result.json`: final synchronization no-op.
- `ext-final-ground-result.json`, `ext-routing-complete.cad`: live track
  readback and native via count.
- `ext-routing-complete-top.svg`, `ext-routing-complete-bottom.svg`: copper
  review before the last text-only connector labels.

Fresh final review PDFs are in `kicad/exports/routing-complete-2026-10-14/`:
`top-review.pdf`, `bottom-review.pdf`, `schematic-review.pdf`.
They are inspection aids, not a Gerber/drill/assembly release package.
