# Driver routing checkpoint

13 October 2026. Partial working PCB, not a fabrication or energization release.
Continuation of `PCB_ROUTING_RULES_2026-10-13.md`; baseline commit `1151aa0`.

## Saved result

- 149 footprints, unchanged schematic and BOM, two copper layers.
- 117 track segments: 92 F.Cu / 25 B.Cu. This pass adds 78 segments, preserving
  all 39 previously present segments, including the 17 inherited input tracks.
- 14 vias total; 12 added in this pass. No copper zones yet.
- Twelve components repositioned deliberately; two final rotations differ
  from the previous checkpoint. All pad UUIDs, numbers and net assignments
  verified unchanged. No footprint substitutions.
- All four driver-to-gate paths and both bootstrap nets connected according
  to saved-file DRC. REGN/DRV_SUP decouplers and bootstrap diode supply joined.
  This does NOT complete the MOSFET power connections or low-side source returns.
- 293 unconnected items, down from 317. Final DRC: 4 pre-existing J27 hole
  clearance errors and 115 silk warnings (2 edge, 63 overlap, 50 over copper).
  No copper clearance, short, courtyard or library mismatch findings.
- Schematic-to-PCB dry-run is `noop`; all 125 nets retain their V2 classes.

## Placement changes

Coordinates in mm, rotations in degrees. All listed parts remain on F.Cu.

| Part | X | Y | Rotation | Reason |
|---|---:|---:|---:|---|
| C61 | 88.75 | 60.25 | -90 | 0.5mm shift to clear driver escape |
| C60 | 91.25 | 60.25 | -90 | Keep aligned decoupler row |
| C65 | 89.00 | 56.75 | 90 | Clear high-side driver via/fanout |
| C66 | 89.00 | 64.75 | -90 | Clear lower fanout |
| R80 | 82.00 | 48.25 | -90 | Input filter outside switching return corridor |
| R81 | 85.00 | 48.25 | -90 | Same, near shunt sense terminal |
| C68 | 80.00 | 51.10 | 180 | Quiet input RC group, assembly spacing |
| C69 | 84.00 | 51.10 | 180 | Remove overlap with underside SW1 route |
| C67 | 84.50 | 54.65 | 90 | Differential filter near ACP/ACN fanout |
| C63 | 81.50 | 54.30 | 90 | Clear the differential filter group |
| C64 | 79.00 | 54.30 | 90 | Retain spaced VAC decoupler row |
| C62 | 76.50 | 54.30 | 90 | Same |

The input filters and VAC decouplers are still unrouted. The first driver
candidate ran SW1 beneath parts of the input sense filter. DRC did not flag
this electrical-noise problem. Visual review caught it; the unrouted filter
group was rearranged before accepting this checkpoint. Actual authored
courtyards were queried and the resulting placement rechecked by DRC.
Keep subsequent ACP/ACN routes to the quiet side of the driver corridor;
do not put them underneath the switching-node return again.

## Actual underside passages

Coordinates name the transition points, not the complete polyline. Signal
vias near U9 are 0.60/0.30mm pad/drill; remote gate-resistor vias 0.80/0.40mm.
Gate routes use 0.60mm away from the short 0.25mm QFN fanouts.

| Net | Transitions / endpoints | Reason and remaining return requirement |
|---|---|---|
| BQ_LODRV1 | (87.4,59.45) to (88.6,53.5), then R77 | Avoid top REGN/bootstrap crossings; low-side GND return still needs final power-ground design |
| BQ_LODRV2 | (87.4,61.05) via x86.7 to (87,67), then R79 | Same; moved left to give more space from HIDRV2 |
| BQ_HIDRV1 | (87.5,57.75) via x86.5 to (86.5,45), then R76 | Route beside its SW1 return, outside the analog filter group |
| BQ_SW1 driver return | (87.5,55.975) via x87.5/y43 to Q10.3 | Dedicated source return, not the main switching power conductor |
| BQ_HIDRV2 | (88.5,62.75) via x88.6 to (88.175,76.2), then R78 | Route beside SW2; not a long top detour around bootstrap/decouplers |
| BQ_SW2 driver return | (89.8,65.525) via x89.8/y77 to Q12.3 | Dedicated source return, not the main switching power conductor |
| Decoupler GND | (90,61.2) to (84.6,60) in U9 EP | Separate short return to IC ground instead of sending driver current through the sense-filter ground spur |

Top-only alternatives encounter the interleaved QFN driver pins, nearby
bootstrap/REGN connections and the input RC group. The four small capacitor
shifts were considered before retaining these underside routes. High-side
command/source returns travel together over their main straight runs; fanouts
and the final turns around the three-pin MOSFET packages separate locally.
These are not controlled-impedance pairs. The SW1/2 approach at the MOSFET
source was widened around the adjacent drain to meet the 0.50mm power class
clearance; no rule was relaxed.

Source: [TI BQ25756 layout guidance, pp. 71-73](https://www.ti.com/lit/ds/symlink/bq25756.pdf).
Our two-layer/top-support/bottom-THT arrangement is a project compromise, not
a copy of TI's multilayer surface-mount reference. Loop inductance, gate
waveforms and EMI remain to be qualified.

## Ground and assembly cautions

The ground track is a working local return, not automatically preferable to
a low-impedance copper region. Reassess it with the eventual planes. Keep
power return out of the small measurement-ground spur. The four MOSFET source/
drain power links and low-side gate return geometry are not finished.

A single 0.30mm-drill ground via is now placed at (84.6,60), within U9's exposed
pad, for the decoupler return. Its center falls between the stock paste windows,
but this is NOT proof against solder wicking: aperture separation is small and
manufacturing/paste registration matters. It is a plain via, not a specified
filled/capped via. Confirm the QFN soldering/stencil/via treatment before fab;
the thermal via array and heat spreading are still unfinished. Do not infer
that one via qualifies the IC thermal pad or the main power ground.

The 0.60mm SW1/SW2 tracks carry driver return only. Future Q10/Q11/L3 and
Q12/Q13/L3 power connections must not rely on these traces. Likewise, a DRC
connected net is not proof of adequate power-current copper.

## Verification and next work

Official MCP readback plus `.konnect-scratch/verify-driver-pass.mjs` checked
39 prior tracks preserved, 78 additions, all intended positions, 149 components,
pad identities/nets, all-net class coverage, sync noop and final DRC categories.
Final saved-file report: `.konnect-scratch/driver-final-drc.json`.
Copper view inspected: `.konnect-scratch/driver-final-verified-detail.png`.
No checks were suppressed. Silkscreen cleanup remains pending, not forgotten.

Next bounded pass: route the input RC/VAC neighborhood and complete dedicated
Kelvin takeoffs; revisit F1/JP30/input-bank placement before main power trunks.
Ground/thermal design, power-loop copper, USB geometry, RF keepout, outline,
heatsink/lead forming and the known J27 footprint issue remain release gates.
