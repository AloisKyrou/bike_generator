# BQ quiet settings placement

13 October 2026. Provisional placement only. Continues
[pass 2](PCB_POWER_PLACEMENT_PASS2_2026-10-13.md).

## Scope and user direction

User confirms the outline will be reconsidered later. Do not constrain the
remaining CV/ESP/USB placement to the inherited70x110mm rectangle.
No outline, routing, netclass, schematic, BOM or library changes in this pass.
The user still intends to route after the assistant prepares placement.

16 previously staged parts placed: R60-R65, R68-R73, TP41-TP44.
C62 moved0.5mm left to clear the frequency-setting resistor courtyard.
63 new parts now placed across three passes;77 remain staged left.
149 total footprints and17 retained input track segments are unchanged.

## Saved coordinates

All listed footprints are F.Cu. Coordinates are footprint anchors in mm.

| Ref | X | Y | Rotation |
|---|---:|---:|---:|
| R60 | 79.8 | 58.4 | -90 |
| R61 | 77.5 | 62.75 | 180 |
| R62 | 78 | 65.5 | 180 |
| R63 | 74 | 48 | -90 |
| R64 | 74 | 52 | -90 |
| R65 | 74 | 56 | -90 |
| R68 | 70 | 58.5 | 0 |
| R69 | 70 | 62 | 0 |
| R70 | 70 | 65.5 | 0 |
| R71 | 76.75 | 60.25 | 180 |
| R72 | 77.5 | 68.5 | 0 |
| R73 | 77.5 | 71 | 180 |
| TP41 | 73.5 | 63 | 0 |
| TP42 | 73.5 | 66.5 | 0 |
| TP44 | 73.5 | 70 | 0 |
| TP43 | 73.5 | 73.5 | 0 |
| C62 | 77.5 | 54.8 | 90 |

## Placement intent

- R60 remains near FSW_SYNC, with the top/left controller escape still to review.
- R63/R64/R65 form an aligned input-threshold divider left of the VAC bypasses.
  Its VAC pickup and ACUV/ACOV taps must avoid switching copper.
- R61/R62 sit toward ICHG/ILIM. R61's other end still goes to RV1; do not
  mistake it for a ground-only resistor.
- R68/R69 are the two I2C links with the external bus ends facing left.
  R70 is the interrupt pull-up, NOT another I2C pull-up.
- R71 is the CE pull-down; R72/R73 are the TS network. The thermistor connector
  remains staged until the control/mechanical neighborhood is planned.
- TP41/TP42/TP44/TP43 form a3.5mm-pitch accessible probe row for ICHG, ILIM,
  GND and REGN respectively. These are bare probe pads, not added connectors.
  Long branches to these pads are suitable only for slow/DC diagnostics;
  they are not a substitute for local high-frequency return probing.
- Analog grounds require a dedicated quiet return tied near the controller
  exposed pad, per the archived TI SLUSEN5A layout guidance, pp71-73.
  A shared GND net name does not specify the physical return path.

No copper is added. Component proximity alone does not establish workable
top-only escape, loop stability, ADC accuracy or a safe power rating.
Review FSW/I2C/threshold escape together before freezing their positions.
Do not let a testpoint branch become a power/driver return path.

## Checks and limits

Independent readback verifies17 changed placements, all untouched placements,
149 footprints,77 staged parts, and the original17 tracks unchanged.
Schematic-to-PCB dry-run: noop, changes[], eight sheets.
Saved DRC:64 findings, comprising4 known J27 hole-clearance errors and60 silk
warnings. No short, copper-clearance, courtyard-overlap, solder-mask-bridge
or library-mismatch finding.326 unconnected items and4 intentional H1-H4
parity findings remain. Not a clean full-board DRC and not routing-ready.

Native top SVG and cropped image inspected. All changed parts are top-side
SMDs/probe pads; bottom components and tracks are unchanged. Silkscreen reference
fields still need supported native repositioning; do not hide them or move
electrically suitable components simply to clear text warnings.

Next: plan K1, both mechanical potentiometers, digipot and selector circuitry
together, then logic/USB and external connectors. Revisit outline from that
placement. Keep the two-layer constraint and bottom heatsink allocation.
V2 netclasses and loop/return routing instructions remain unfinished.
No fabrication, charging or energization approval.

## Evidence

Repository-root .konnect-scratch:
pcb-quiet-read-result.json, pcb-quiet-place-result.json,
pcb-quiet-verified-result.json, v2-quiet-verified-drc.json,
verify-quiet-placement.mjs, v2-quiet-verified-detail.png.
Snapshot before this pass: v2-before-quiet-placement.kicad_pcb.

Saved PCB SHA256:
4A79747BDDAD426B11FB8837628C0DE8FB85C7B198FFC4FA83981DA0A1EF8BA3.
